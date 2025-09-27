package com.homeride.backend.service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.homeride.backend.dto.RideRequestDTO;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.model.RideParticipant;
import com.homeride.backend.repository.EmployeeRepository;
import com.homeride.backend.repository.RideParticipantRepository;
import com.homeride.backend.repository.RideRequestRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.ArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.jpa.domain.Specification;

@Service
public class RideRequestService {

    private static final Logger logger = LoggerFactory.getLogger(RideRequestService.class);

    private final RideRequestRepository rideRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final RideParticipantRepository rideParticipantRepository;

    @Autowired
    public RideRequestService(RideRequestRepository rideRequestRepository,
                              EmployeeRepository employeeRepository,
                              RideParticipantRepository rideParticipantRepository) {
        this.rideRequestRepository = rideRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rideParticipantRepository = rideParticipantRepository;
    }

    public List<RideRequest> getAllRideRequests(String origin, String destination, LocalDate travelDate,
                                                Integer passengerCount, String rideType) {

        boolean isOriginProvided = origin != null && !origin.trim().isEmpty();
        boolean isDestinationProvided = destination != null && !destination.trim().isEmpty();

        // Step 1: Get rides based on location using custom repository methods
        List<RideRequest> rides;
        if (isOriginProvided && isDestinationProvided) {
            // Use custom query method for origin and destination search
            rides = rideRequestRepository.findByOriginAndDestinationInPath(origin, destination);
        } else if (isOriginProvided) {
            // Use custom query method for single location search
            rides = rideRequestRepository.findByLocationInPath(origin);
        } else if (isDestinationProvided) {
            // Use custom query method for single location search
            rides = rideRequestRepository.findByLocationInPath(destination);
        } else {
            // No location filter, get all rides
            rides = rideRequestRepository.findAll();
        }

        // Step 2: Apply additional filters in memory
        return rides.stream()
                .filter(ride -> {
                    // Date filter
                    if (travelDate != null) {
                        LocalDateTime startOfDay = travelDate.atStartOfDay();
                        LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
                        if (ride.getTravelDateTime().isBefore(startOfDay) || ride.getTravelDateTime().isAfter(endOfDay)) {
                            return false;
                        }
                    }

                    // Cutoff time filter (12 hours before current time)
                    if (ride.getTravelDateTime().isBefore(LocalDateTime.now().minusHours(12))) {
                        return false;
                    }

                    // Ride type filter
                    if ("offered".equalsIgnoreCase(rideType)) {
                        if (!"OFFERED".equals(ride.getRideType())) {
                            return false;
                        }
                        // Check capacity for offered rides
                        if (passengerCount != null && passengerCount > 0) {
                            if (ride.getVehicleCapacity() == null || ride.getVehicleCapacity() < passengerCount) {
                                return false;
                            }
                        }
                    } else if ("requested".equalsIgnoreCase(rideType)) {
                        if (!"REQUESTED".equals(ride.getRideType())) {
                            return false;
                        }
                    }
                    // If no specific ride type is requested, show both offered and requested rides

                    // Additional path validation for origin-destination searches
                    if (isOriginProvided && isDestinationProvided) {
                        return canAccommodateJourney(ride, origin, destination);
                    }

                    return true;
                })
                .collect(Collectors.toList());
    }

    /**
     * Check if a ride can accommodate a journey from origin to destination
     */
    private boolean canAccommodateJourney(RideRequest ride, String origin, String destination) {
        // Build the complete path of the ride
        List<String> fullPath = new ArrayList<>();
        fullPath.add(ride.getOrigin());
        if (ride.getStops() != null && !ride.getStops().isEmpty()) {
            fullPath.addAll(ride.getStops());
        }
        fullPath.add(ride.getDestination());

        // Find the index of origin and destination in the path
        int originIndex = -1;
        int destinationIndex = -1;

        for (int i = 0; i < fullPath.size(); i++) {
            String location = fullPath.get(i);
            if (originIndex == -1 && locationMatches(location, origin)) {
                originIndex = i;
            }
            if (locationMatches(location, destination)) {
                destinationIndex = i;
            }
        }

        // The journey is valid if:
        // 1. Both origin and destination are found in the path
        // 2. Origin comes before destination in the path
        return originIndex != -1 && destinationIndex != -1 && destinationIndex > originIndex;
    }

    /**
     * Check if a location matches the search term (case-insensitive partial match)
     */
    private boolean locationMatches(String location, String searchTerm) {
        if (location == null || searchTerm == null) {
            return false;
        }
        return location.toLowerCase().contains(searchTerm.toLowerCase());
    }

    @Transactional
    public RideRequest createRideRequest(RideRequestDTO rideRequestDTO, String requesterEmail) {
        Employee requester = employeeRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + requesterEmail));

        RideRequest newRideRequest = new RideRequest();
        newRideRequest.setOrigin(rideRequestDTO.getOrigin());
        newRideRequest.setDestination(rideRequestDTO.getDestination());
        newRideRequest.setStops(rideRequestDTO.getStops());
        newRideRequest.setTravelDateTime(rideRequestDTO.getTravelDateTime());
        newRideRequest.setStatus("PENDING");
        newRideRequest.setRequester(requester);
        newRideRequest.setRideType(rideRequestDTO.getRideType());
        newRideRequest.setVehicleModel(rideRequestDTO.getVehicleModel());
        newRideRequest.setVehicleCapacity(rideRequestDTO.getVehicleCapacity());
        newRideRequest.setGenderPreference(rideRequestDTO.getGenderPreference());

        return rideRequestRepository.save(newRideRequest);
    }

    @Transactional
    public void deleteRide(Long rideId, String userEmail) {
        logger.info("--- Initiating Delete Ride Request ---");
        logger.info("Attempting to delete ride with ID: {}", rideId);
        logger.info("Action initiated by user with email: {}", userEmail);

        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee user = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + userEmail));

        Long requesterId = ride.getRequester().getId();
        Long currentUserId = user.getId();

        // Check if the current user is either the requester or the driver
        if (!Objects.equals(requesterId, currentUserId) && (ride.getDriver() == null || !Objects.equals(ride.getDriver().getId(), currentUserId))) {
            logger.warn("AUTHORIZATION FAILED: Requester ID [{}] and Driver ID [{}] do not match Current User ID [{}].", requesterId, (ride.getDriver() != null ? ride.getDriver().getId() : "null"), currentUserId);
            throw new IllegalStateException("You are not authorized to delete this ride.");
        }

        logger.info("Authorization successful. Deleting ride ID: {}", rideId);
        rideRequestRepository.delete(ride);
    }

    @Transactional
    public RideParticipant joinRideRequest(Long rideId, String participantEmail) {
        RideRequest rideRequest = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee participant = employeeRepository.findByEmail(participantEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + participantEmail));

        String preference = rideRequest.getGenderPreference();
        if ("FEMALE_ONLY".equalsIgnoreCase(preference)) {
            if (!"FEMALE".equalsIgnoreCase(participant.getGender())) {
                throw new IllegalStateException("This ride is for female participants only.");
            }
        }

        if ("OFFERED".equalsIgnoreCase(rideRequest.getRideType()) && rideRequest.getVehicleCapacity() != null) {
            int currentParticipants = rideRequest.getParticipants().size();
            if (currentParticipants >= rideRequest.getVehicleCapacity()) {
                throw new IllegalStateException("This ride is already full.");
            }
        }

        if (rideRequest.getRequester().equals(participant)) {
            throw new IllegalStateException("You cannot join a ride that you posted.");
        }

        if (rideParticipantRepository.existsByRideRequestAndParticipant(rideRequest, participant)) {
            throw new IllegalStateException("You have already joined this ride.");
        }

        RideParticipant rideParticipant = new RideParticipant();
        rideParticipant.setRideRequest(rideRequest);
        rideParticipant.setParticipant(participant);

        return rideParticipantRepository.save(rideParticipant);
    }

    @Transactional
    public RideRequest acceptRideRequest(Long rideId, String driverEmail) {
        RideRequest rideRequest = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Employee driver = employeeRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        String preference = rideRequest.getGenderPreference();
        if ("FEMALE_ONLY".equalsIgnoreCase(preference)) {
            if (!"FEMALE".equalsIgnoreCase(driver.getGender())) {
                throw new IllegalStateException("This ride request is for a female driver only.");
            }
        }

        if (!rideRequest.getRideType().equals("REQUESTED")) {
            throw new IllegalStateException("This ride is an offer, not a request.");
        }

        if (rideRequest.getDriver() != null) {
            throw new IllegalStateException("This ride request has already been accepted by a driver.");
        }

        if (rideRequest.getRequester().equals(driver)) {
            throw new IllegalStateException("You cannot accept your own ride request.");
        }

        rideRequest.setDriver(driver);
        rideRequest.setStatus("CONFIRMED");

        return rideRequestRepository.save(rideRequest);
    }

    public List<RideRequest> getRidesForUser(String userEmail) {
        Employee employee = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return rideRequestRepository.findAll().stream()
                .filter(ride -> ride.getRequester().equals(employee) ||
                        (ride.getDriver() != null && ride.getDriver().equals(employee)) ||
                        (ride.getParticipants() != null && ride.getParticipants().stream()
                                .anyMatch(p -> p.getParticipant().equals(employee))))
                .collect(Collectors.toList());
    }
}