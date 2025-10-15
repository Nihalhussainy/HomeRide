package com.homeride.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TravelInfo {
    private int durationInMinutes;
    private double distanceInKm;
    private String polyline;
    private String summary; // NEW: Add this field
}