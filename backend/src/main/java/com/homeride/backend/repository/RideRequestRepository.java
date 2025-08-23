package com.homeride.backend.repository;

import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    long countByRequester(Employee requester);

    // NEW: Custom query to find all rides with a travelDateTime after a specific time.
    // This lets the database do the filtering, which is much more reliable and efficient.
    @Query("SELECT r FROM RideRequest r WHERE r.travelDateTime > :cutoffTime")
    List<RideRequest> findActiveRides(@Param("cutoffTime") LocalDateTime cutoffTime);
}
