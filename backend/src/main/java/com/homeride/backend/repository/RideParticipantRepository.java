package com.homeride.backend.repository;

import com.homeride.backend.model.RideParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.homeride.backend.model.Employee; // Add this import
import com.homeride.backend.model.RideRequest; // Add this import
@Repository
public interface RideParticipantRepository extends JpaRepository<RideParticipant, Long> {
    boolean existsByRideRequestAndParticipant(RideRequest rideRequest, Employee participant);
    long countByParticipant(Employee participant);
}