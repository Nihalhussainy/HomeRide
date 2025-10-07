package com.homeride.backend.service;

import com.homeride.backend.dto.RideRequestDTO;
import com.homeride.backend.dto.TravelInfo;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideParticipant;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.repository.EmployeeRepository;
import com.homeride.backend.repository.RideParticipantRepository;
import com.homeride.backend.repository.RideRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RideRequestService {

    private static final Logger logger = LoggerFactory.getLogger(RideRequestService.class);

    private final RideRequestRepository rideRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final RideParticipantRepository rideParticipantRepository;
    private final GoogleMapsService googleMapsService;
    private final RatingService ratingService;

    @Autowired
    public RideRequestService(RideRequestRepository rideRequestRepository,
                              EmployeeRepository employeeRepository,
                              RideParticipantRepository rideParticipantRepository,
                              GoogleMapsService googleMapsService,
                              RatingService ratingService) {
        this.rideRequestRepository = rideRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rideParticipantRepository = rideParticipantRepository;
        this.googleMapsService = googleMapsService;
        this.ratingService = ratingService;
    }

    public RideRequest getRideById(Long rideId) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        if (ride.getRequester() != null) {
            Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
            ride.getRequester().setAverageRating(avgRating);
        }

        return ride;
    }

    public List<RideRequest> getAllRideRequests(String origin, String destination, String travelDateTime, Integer passengerCount) {
        List<RideRequest> rides = rideRequestRepository.findAll().stream()
                .filter(r -> "OFFERED".equals(r.getRideType()) && r.getTravelDateTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        List<RideRequest> filteredRides = rides.stream()
                .filter(ride -> {
                    // Filter by date if provided
                    if (travelDateTime != null && !travelDateTime.trim().isEmpty()) {
                        try {
                            LocalDate searchDate = LocalDate.parse(travelDateTime);
                            if (!ride.getTravelDateTime().toLocalDate().isEqual(searchDate)) {
                                return false;
                            }
                        } catch (Exception e) {
                            logger.warn("Invalid date format: {}", travelDateTime);
                        }
                    }

                    // Filter by passenger count
                    if (passengerCount != null && passengerCount > 0) {
                        int availableSeats = ride.getVehicleCapacity() - ride.getParticipants().size();
                        if (availableSeats < passengerCount) {
                            return false;
                        }
                    }

                    // Filter by origin and destination
                    if (origin != null && !origin.trim().isEmpty() && destination != null && !destination.trim().isEmpty()) {
                        return canAccommodateJourney(ride, origin, destination);
                    }

                    return true;
                })
                .collect(Collectors.toList());

        // Add average ratings
        for (RideRequest ride : filteredRides) {
            if (ride.getRequester() != null) {
                Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
                ride.getRequester().setAverageRating(avgRating);
            }
        }

        return filteredRides;
    }

    private boolean canAccommodateJourney(RideRequest ride, String origin, String destination) {
        List<String> fullPath = new ArrayList<>();
        fullPath.add(ride.getOrigin());
        if (ride.getStops() != null) {
            fullPath.addAll(ride.getStops());
        }
        fullPath.add(ride.getDestination());

        int originIndex = -1;
        int destinationIndex = -1;

        for (int i = 0; i < fullPath.size(); i++) {
            if (originIndex == -1 && fullPath.get(i).toLowerCase().contains(origin.toLowerCase())) {
                originIndex = i;
            }
            if (fullPath.get(i).toLowerCase().contains(destination.toLowerCase())) {
                destinationIndex = i;
            }
        }
        return originIndex != -1 && destinationIndex != -1 && destinationIndex > originIndex;
    }

    @Transactional
    public RideRequest createRideOffer(RideRequestDTO rideRequestDTO, String requesterEmail) {
        Employee requester = employeeRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + requesterEmail));

        RideRequest newRideOffer = new RideRequest();
        newRideOffer.setOrigin(rideRequestDTO.getOrigin());
        newRideOffer.setDestination(rideRequestDTO.getDestination());
        newRideOffer.setStops(rideRequestDTO.getStops());
        newRideOffer.setTravelDateTime(rideRequestDTO.getTravelDateTime());
        newRideOffer.setStatus("PENDING");
        newRideOffer.setRequester(requester);
        newRideOffer.setRideType("OFFERED");
        newRideOffer.setVehicleModel(rideRequestDTO.getVehicleModel());
        newRideOffer.setVehicleCapacity(rideRequestDTO.getVehicleCapacity());
        newRideOffer.setGenderPreference(rideRequestDTO.getGenderPreference());
        newRideOffer.setPrice(rideRequestDTO.getPrice());
        newRideOffer.setDriverNote(rideRequestDTO.getDriverNote()); // NEW: Set the driver note

        TravelInfo travelInfo = googleMapsService.getTravelInfo(rideRequestDTO.getOrigin(), rideRequestDTO.getDestination());
        newRideOffer.setDuration(travelInfo.getDurationInMinutes());
        newRideOffer.setDistance(travelInfo.getDistanceInKm());

        return rideRequestRepository.save(newRideOffer);
    }

    @Transactional
    public void deleteRide(Long rideId, String userEmail) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee user = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + userEmail));

        if (!Objects.equals(ride.getRequester().getId(), user.getId())) {
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

        if (!"OFFERED".equalsIgnoreCase(rideRequest.getRideType())) {
            throw new IllegalStateException("You can only join offered rides.");
        }

        String preference = rideRequest.getGenderPreference();
        if ("FEMALE_ONLY".equalsIgnoreCase(preference)) {
            if (!"FEMALE".equalsIgnoreCase(participant.getGender())) {
                throw new IllegalStateException("This ride is for female participants only.");
            }
        }

        int availableSeats = rideRequest.getVehicleCapacity() - rideRequest.getParticipants().size();
        if (availableSeats < 1) {
            throw new IllegalStateException("This ride is already full.");
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

    public List<RideRequest> getRidesForUser(String userEmail) {
        Employee employee = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<RideRequest> userRides = rideRequestRepository.findAll().stream()
                .filter(ride -> ride.getRequester().equals(employee) ||
                        (ride.getParticipants() != null && ride.getParticipants().stream()
                                .anyMatch(p -> p.getParticipant().equals(employee))))
                .collect(Collectors.toList());

        for (RideRequest ride : userRides) {
            if (ride.getRequester() != null) {
                Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
                ride.getRequester().setAverageRating(avgRating);
            }
        }
        return userRides;
    }
}