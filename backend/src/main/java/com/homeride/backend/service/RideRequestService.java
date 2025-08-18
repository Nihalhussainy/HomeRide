package com.homeride.backend.service;
import java.util.stream.Collectors;
import com.homeride.backend.dto.RideRequestDTO;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.model.RideParticipant; // <-- New import
import com.homeride.backend.repository.EmployeeRepository;
import com.homeride.backend.repository.RideParticipantRepository; // <-- New import
import com.homeride.backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class RideRequestService {

    private final RideRequestRepository rideRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final RideParticipantRepository rideParticipantRepository; // <-- 1. Add new repository

    @Autowired
    public RideRequestService(RideRequestRepository rideRequestRepository, EmployeeRepository employeeRepository, RideParticipantRepository rideParticipantRepository) { // <-- 2. Update constructor
        this.rideRequestRepository = rideRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rideParticipantRepository = rideParticipantRepository; // <-- 2. Update constructor
    }

    public List<RideRequest> getAllRideRequests() {
        return rideRequestRepository.findAll();
    }

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

        return rideRequestRepository.save(newRideRequest);
    }

    // 3. Add the new method to handle joining a ride
    public RideParticipant joinRideRequest(Long rideId, String participantEmail) {
        RideRequest rideRequest = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee participant = employeeRepository.findByEmail(participantEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + participantEmail));

        // ✅ NEW: Prevent a user from joining their own ride
        if (rideRequest.getRequester().equals(participant)) {
            throw new IllegalStateException("You cannot join a ride that you posted.");
        }

        // ✅ NEW: Check if the user has already joined this ride
        if (rideParticipantRepository.existsByRideRequestAndParticipant(rideRequest, participant)) {
            throw new IllegalStateException("You have already joined this ride.");
        }

        RideParticipant rideParticipant = new RideParticipant();
        rideParticipant.setRideRequest(rideRequest);
        rideParticipant.setParticipant(participant);

        return rideParticipantRepository.save(rideParticipant);
    }
    // Add this method
    public RideRequest acceptRideRequest(Long rideId, String driverEmail) {
        RideRequest rideRequest = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Employee driver = employeeRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // Add validation checks
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

        // Find all rides where the user is the requester OR a participant
        return rideRequestRepository.findAll().stream()
                .filter(ride -> ride.getRequester().equals(employee) ||
                        ride.getParticipants().stream().anyMatch(p -> p.getParticipant().equals(employee)))
                .collect(Collectors.toList());
    }

}