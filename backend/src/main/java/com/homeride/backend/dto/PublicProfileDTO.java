package com.homeride.backend.dto;

import com.homeride.backend.model.Rating;
import lombok.Data;
import java.util.List;

@Data
public class PublicProfileDTO {
    private Long id;
    private String name;
    private String email;
    private String profilePictureUrl;
    private String gender; // You can add this if you want gender to be public
    private Double averageRating;
    private Long totalRides;
    private List<Rating> receivedRatings;
}