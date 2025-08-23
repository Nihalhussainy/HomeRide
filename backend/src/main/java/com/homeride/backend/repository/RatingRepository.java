package com.homeride.backend.repository;

import com.homeride.backend.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    List<Rating> findByRateeId(Long rateeId);
    boolean existsByRideRequestAndRaterAndRatee(RideRequest rideRequest, Employee rater, Employee ratee);
    List<Rating> findByRater(Employee rater);

    // NEW: A method to delete all ratings associated with a specific ride request.
    void deleteAllByRideRequest(RideRequest rideRequest);
}
