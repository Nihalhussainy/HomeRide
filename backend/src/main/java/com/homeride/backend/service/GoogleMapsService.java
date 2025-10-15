package com.homeride.backend.service;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.homeride.backend.dto.TravelInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.maps.DirectionsApiRequest;
import java.util.Arrays;

@Service
public class GoogleMapsService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMapsService.class);
    private final GeoApiContext geoApiContext;

    @Value("${google.maps.api.key:}")
    private String apiKey;

    private static final TravelInfo DEFAULT_TRAVEL_INFO = new TravelInfo(180, 200.0, "", "Default Route");

    @Autowired
    public GoogleMapsService(GeoApiContext geoApiContext) {
        this.geoApiContext = geoApiContext;
    }

    public TravelInfo getTravelInfo(String origin, String destination, String[] stops) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Google Maps API key is not configured. Returning default travel info.");
            return DEFAULT_TRAVEL_INFO;
        }
        try {
            DirectionsApiRequest request = DirectionsApi.newRequest(geoApiContext)
                    .origin(origin)
                    .destination(destination);

            // NEW: Add waypoints to the request if they exist
            if (stops != null && stops.length > 0) {
                request.waypoints(stops);
            }

            DirectionsResult result = request.await();

            if (result.routes != null && result.routes.length > 0) {
                DirectionsRoute route = result.routes[0];
                String polyline = route.overviewPolyline.getEncodedPath();
                String summary = route.summary;

                // Sum up distance and duration from all legs of the journey
                long totalDurationInSeconds = Arrays.stream(route.legs).mapToLong(leg -> leg.duration.inSeconds).sum();
                long totalDistanceInMeters = Arrays.stream(route.legs).mapToLong(leg -> leg.distance.inMeters).sum();

                int durationInMinutes = (int) (totalDurationInSeconds / 60);
                double distanceInKm = totalDistanceInMeters / 1000.0;

                return new TravelInfo(durationInMinutes, distanceInKm, polyline, summary);
            }
        } catch (Exception e) {
            logger.error("Error fetching travel info from Google Maps API: {}", e.getMessage());
        }
        return DEFAULT_TRAVEL_INFO;
    }

    public LatLng geocodeAddress(String address) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Google Maps API key is not configured. Geocoding disabled.");
            return null;
        }
        try {
            GeocodingResult[] results = GeocodingApi.geocode(geoApiContext, address).await();
            if (results != null && results.length > 0) {
                return results[0].geometry.location;
            }
        } catch (Exception e) {
            logger.error("Error during geocoding for address '{}': {}", address, e.getMessage());
        }
        return null;
    }

    public String reverseGeocode(LatLng location) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            logger.warn("Google Maps API key is not configured. Reverse geocoding disabled.");
            return "Service unavailable";
        }
        try {
            GeocodingResult[] results = GeocodingApi.reverseGeocode(geoApiContext, location).await();
            if (results != null && results.length > 0) {
                return results[0].formattedAddress;
            }
        } catch (Exception e) {
            logger.error("Error during reverse geocoding for location '{}': {}", location, e.getMessage());
        }
        return "Unknown location";
    }
}