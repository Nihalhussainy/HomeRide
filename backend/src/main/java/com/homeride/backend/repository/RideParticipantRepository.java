package com.homeride.backend.repository;

import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.homeride.backend.model.RideRequest;

import java.util.List;

@Repository
public interface RideParticipantRepository extends JpaRepository<RideParticipant, Long> {
    boolean existsByRideRequestAndParticipant(RideRequest rideRequest, Employee participant);
    long countByParticipant(Employee participant);

    // New query to eagerly fetch the participant details
    @Query("SELECT p FROM RideParticipant p JOIN FETCH p.participant WHERE p.rideRequest.id = :rideRequestId")
    List<RideParticipant> findByRideRequestIdWithParticipant(Long rideRequestId);
}