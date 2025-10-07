package com.homeride.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class RideRequestDTO {
    private String origin;
    private String destination;
    private List<String> stops;
    private LocalDateTime travelDateTime;
    private String vehicleModel;
    private Integer vehicleCapacity;
    private String genderPreference;
    private Double price;
    private String driverNote;
    // NOTE: rideType, isEmergency, duration and distance will be set by the backend
}