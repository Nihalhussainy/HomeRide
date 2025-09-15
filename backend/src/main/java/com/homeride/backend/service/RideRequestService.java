package com.homeride.backend.service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.stream.Collectors;
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
    public RideRequestService(RideRequestRepository rideRequestRepository, EmployeeRepository employeeRepository, RideParticipantRepository rideParticipantRepository) {
        this.rideRequestRepository = rideRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rideParticipantRepository = rideParticipantRepository;
    }
    // Updated method signature with LocalDate
    public List<RideRequest> getAllRideRequests(String origin, String destination, LocalDate travelDate, Integer passengerCount, String rideType) {
        Specification<RideRequest> spec = Specification.not(null);
        // Apply common filters first
        if (origin != null && !origin.trim().isEmpty()) {
            spec = spec.and(RideRequestRepository.Ridespecs.hasOrigin(origin));
        }
        if (destination != null && !destination.trim().isEmpty()) {
            spec = spec.and(RideRequestRepository.Ridespecs.hasDestination(destination));
        }
        // Handle date filtering correctly by converting LocalDate to a LocalDateTime range
        if (travelDate != null) {
            LocalDateTime startOfDay = travelDate.atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1).minusNanos(1);
            spec = spec.and((root, query, cb) -> cb.between(root.get("travelDateTime"), startOfDay, endOfDay));
        }
        // Apply rideType-specific filters
        if ("offered".equalsIgnoreCase(rideType)) {
            spec = spec.and(RideRequestRepository.Ridespecs.isOfferedRide());
            if (passengerCount != null && passengerCount > 0) {
                spec = spec.and(RideRequestRepository.Ridespecs.hasCapacityFor(passengerCount));
            }
        } else if ("requested".equalsIgnoreCase(rideType)) {
            spec = spec.and(RideRequestRepository.Ridespecs.isRequestedRide());
            // You can add more specific filters for requested rides here if needed
        } else { // This handles "all" or null/empty rideType
            // Create a compound specification to search for both offered and requested rides
            Specification<RideRequest> offeredSpec = RideRequestRepository.Ridespecs.isOfferedRide();
            if (passengerCount != null && passengerCount > 0) {
                offeredSpec = offeredSpec.and(RideRequestRepository.Ridespecs.hasCapacityFor(passengerCount));
            }
            Specification<RideRequest> requestedSpec = RideRequestRepository.Ridespecs.isRequestedRide();
            spec = spec.and(Specification.anyOf(offeredSpec, requestedSpec));
        }
        // Always filter out old rides
        spec = spec.and(RideRequestRepository.Ridespecs.isAfterCutoffTime(LocalDateTime.now().minusHours(12)));

        // This is the key change. Call the repository method with the EntityGraph.
        return rideRequestRepository.findAll(spec);
    }
    @Transactional
    public RideRequest createRideRequest(RideRequestDTO rideRequestDTO, String requesterEmail) {
        Employee requester = employeeRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + requesterEmail));
        RideRequest newRideRequest = new RideRequest();
        newRideRequest.setOrigin(rideRequestDTO.getOrigin());
        newRideRequest.setDestination(rideRequestDTO.getDestination());
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
        logger.info("Ride was requested by user ID: {}", requesterId);
        logger.info("Current user's ID is: {}", currentUserId);
        if (!Objects.equals(requesterId, currentUserId)) {
            logger.warn("AUTHORIZATION FAILED: Requester ID [{}] does not match Current User ID [{}].", requesterId, currentUserId);
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
                        (ride.getParticipants() != null && ride.getParticipants().stream().anyMatch(p -> p.getParticipant().equals(employee))))
                .collect(Collectors.toList());
    }
}