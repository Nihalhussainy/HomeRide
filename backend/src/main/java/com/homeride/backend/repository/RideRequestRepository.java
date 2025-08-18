package com.homeride.backend.repository;

import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long> {
    long countByRequester(Employee requester);
}