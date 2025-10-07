package com.homeride.backend.service;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.homeride.backend.dto.TravelInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GoogleMapsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsService.class);
    private final GeoApiContext geoApiContext;

    @Value("${google.maps.api.key:}")
    private String apiKey;

    private static final int DEFAULT_DURATION_MINUTES = 180;
    private static final double DEFAULT_DISTANCE_KM = 200.0;

    @Autowired
    public GoogleMapsService(GeoApiContext geoApiContext) {
        this.geoApiContext = geoApiContext;
    }

    public TravelInfo getTravelInfo(String origin, String destination) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Google Maps API key is not configured. Returning default travel info.");
            return new TravelInfo(DEFAULT_DURATION_MINUTES, DEFAULT_DISTANCE_KM);
        }

        try {
            DirectionsResult result = DirectionsApi.newRequest(geoApiContext)
                    .origin(origin)
                    .destination(destination)
                    .await();

            if (result.routes != null && result.routes.length > 0) {
                DirectionsRoute route = result.routes[0];
                if (route.legs != null && route.legs.length > 0) {
                    long durationInSeconds = route.legs[0].duration.inSeconds;
                    long distanceInMeters = route.legs[0].distance.inMeters;

                    int durationInMinutes = (int) (durationInSeconds / 60);
                    double distanceInKm = distanceInMeters / 1000.0;

                    logger.info("Successfully fetched travel info for {} -> {}: {} min, {} km", origin, destination, durationInMinutes, distanceInKm);
                    return new TravelInfo(durationInMinutes, distanceInKm);
                }
            }
        } catch (Exception e) {
            logger.error("Error fetching travel info from Google Maps API: {}", e.getMessage());
        }

        logger.warn("Could not retrieve travel info for origin '{}' and destination '{}'. Returning default values.", origin, destination);
        return new TravelInfo(DEFAULT_DURATION_MINUTES, DEFAULT_DISTANCE_KM);
    }
}
