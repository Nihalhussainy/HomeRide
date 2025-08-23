package com.homeride.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RideRequestDTO {
    private String origin;
    private String destination;
    private LocalDateTime travelDateTime;
    private String rideType;
    private boolean isEmergency;

    // NEW: Added vehicle and preference fields
    private String vehicleModel;
    private Integer vehicleCapacity;
    private String genderPreference;
}
