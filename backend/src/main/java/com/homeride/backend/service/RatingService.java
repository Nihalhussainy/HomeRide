package com.homeride.backend.service;

import com.homeride.backend.dto.RatingDTO;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.Rating;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.repository.EmployeeRepository;
import com.homeride.backend.repository.RatingRepository;
import com.homeride.backend.repository.RideRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final EmployeeRepository employeeRepository;
    private final RideRequestRepository rideRequestRepository;

    @Autowired
    public RatingService(RatingRepository ratingRepository, EmployeeRepository employeeRepository, RideRequestRepository rideRequestRepository) {
        this.ratingRepository = ratingRepository;
        this.employeeRepository = employeeRepository;
        this.rideRequestRepository = rideRequestRepository;
    }

    public Rating submitRating(RatingDTO ratingDTO, String raterEmail) {
        Employee rater = employeeRepository.findByEmail(raterEmail)
                .orElseThrow(() -> new RuntimeException("Rater not found"));

        Employee ratee = employeeRepository.findById(ratingDTO.getRateeId())
                .orElseThrow(() -> new RuntimeException("User being rated not found"));

        RideRequest rideRequest = rideRequestRepository.findById(ratingDTO.getRideRequestId())
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        // ✅ NEW: Check if a rating from this rater to this ratee for this ride already exists
        if (ratingRepository.existsByRideRequestAndRaterAndRatee(rideRequest, rater, ratee)) {
            throw new IllegalStateException("You have already submitted a rating for this user on this ride.");
        }

        Rating newRating = new Rating();
        newRating.setRater(rater);
        newRating.setRatee(ratee);
        newRating.setRideRequest(rideRequest);
        newRating.setScore(ratingDTO.getScore());
        newRating.setComment(ratingDTO.getComment());

        return ratingRepository.save(newRating);
    }
    // Add this method
    public List<Rating> getRatingsForUser(String userEmail) {
        Employee employee = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ratingRepository.findByRateeId(employee.getId());
    }
    // Add this method
    public List<Rating> getRatingsGivenByUser(String raterEmail) {
        Employee rater = employeeRepository.findByEmail(raterEmail)
                .orElseThrow(() -> new RuntimeException("Rater not found"));
        return ratingRepository.findByRater(rater);
    }
}