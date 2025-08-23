package com.homeride.backend.controller;

import com.homeride.backend.dto.RideRequestDTO;
import com.homeride.backend.model.RideParticipant;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.service.RideRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/rides")
public class RideRequestController {

    private final RideRequestService rideRequestService;

    @Autowired
    public RideRequestController(RideRequestService rideRequestService) {
        this.rideRequestService = rideRequestService;
    }

    @PostMapping("/request")
    public ResponseEntity<RideRequest> createRideRequest(@RequestBody RideRequestDTO rideRequestDTO, Principal principal) {
        String requesterEmail = principal.getName();
        RideRequest newRideRequest = rideRequestService.createRideRequest(rideRequestDTO, requesterEmail);
        return ResponseEntity.ok(newRideRequest);
    }

    @GetMapping
    public ResponseEntity<List<RideRequest>> getAllRides() {
        List<RideRequest> rides = rideRequestService.getAllRideRequests();
        return ResponseEntity.ok(rides);
    }

    @PostMapping("/{rideId}/join")
    public ResponseEntity<RideParticipant> joinRide(@PathVariable Long rideId, Principal principal) {
        String participantEmail = principal.getName();
        RideParticipant rideParticipant = rideRequestService.joinRideRequest(rideId, participantEmail);
        return ResponseEntity.ok(rideParticipant);
    }

    @PostMapping("/{rideId}/accept")
    public ResponseEntity<RideRequest> acceptRide(@PathVariable Long rideId, Principal principal) {
        String driverEmail = principal.getName();
        RideRequest updatedRide = rideRequestService.acceptRideRequest(rideId, driverEmail);
        return ResponseEntity.ok(updatedRide);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<RideRequest>> getMyRides(Principal principal) {
        List<RideRequest> myRides = rideRequestService.getRidesForUser(principal.getName());
        return ResponseEntity.ok(myRides);
    }

    // NEW: Endpoint for deleting a ride
    @DeleteMapping("/{rideId}")
    public ResponseEntity<?> deleteRide(@PathVariable Long rideId, Principal principal) {
        rideRequestService.deleteRide(rideId, principal.getName());
        return ResponseEntity.ok().build(); // Return a 200 OK response with no body
    }
}
