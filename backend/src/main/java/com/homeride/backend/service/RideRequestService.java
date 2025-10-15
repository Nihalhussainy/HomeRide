// backend/service/RideRequestService.java
package com.homeride.backend.service;

import com.google.maps.model.LatLng;
import com.homeride.backend.dto.RideRequestDTO;
import com.homeride.backend.dto.StopoverDto;
import com.homeride.backend.dto.TravelInfo;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideParticipant;
import com.homeride.backend.model.RideRequest;
import com.homeride.backend.model.Stopover;
import com.homeride.backend.repository.EmployeeRepository;
import com.homeride.backend.repository.RideParticipantRepository;
import com.homeride.backend.repository.RideRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class RideRequestService {

    private static final Logger logger = LoggerFactory.getLogger(RideRequestService.class);

    private final RideRequestRepository rideRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final RideParticipantRepository rideParticipantRepository;
    private final GoogleMapsService googleMapsService;
    private final RatingService ratingService;

    @Autowired
    public RideRequestService(RideRequestRepository rideRequestRepository,
                              EmployeeRepository employeeRepository,
                              RideParticipantRepository rideParticipantRepository,
                              GoogleMapsService googleMapsService,
                              RatingService ratingService) {
        this.rideRequestRepository = rideRequestRepository;
        this.employeeRepository = employeeRepository;
        this.rideParticipantRepository = rideParticipantRepository;
        this.googleMapsService = googleMapsService;
        this.ratingService = ratingService;
    }

    public RideRequest getRideById(Long rideId) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        if (ride.getRequester() != null) {
            Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
            ride.getRequester().setAverageRating(avgRating);
        }

        return ride;
    }

    public List<RideRequest> getAllRideRequests(String origin, String destination, String travelDateTime, Integer passengerCount) {
        List<RideRequest> rides = rideRequestRepository.findAll().stream()
                .filter(r -> "OFFERED".equals(r.getRideType()) && r.getTravelDateTime().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());

        List<RideRequest> filteredRides = rides.stream()
                .filter(ride -> {
                    if (travelDateTime != null && !travelDateTime.trim().isEmpty()) {
                        try {
                            LocalDate searchDate = LocalDate.parse(travelDateTime);
                            if (!ride.getTravelDateTime().toLocalDate().isEqual(searchDate)) {
                                return false;
                            }
                        } catch (Exception e) {
                            logger.warn("Invalid date format: {}", travelDateTime);
                        }
                    }

                    if (passengerCount != null && passengerCount > 0) {
                        int availableSeats = ride.getVehicleCapacity() - ride.getParticipants().size();
                        if (availableSeats < passengerCount) {
                            return false;
                        }
                    }

                    if (origin != null && !origin.trim().isEmpty() &&
                            destination != null && !destination.trim().isEmpty()) {
                        return canAccommodateJourney(ride, origin, destination);
                    }

                    return true;
                })
                .collect(Collectors.toList());

        for (RideRequest ride : filteredRides) {
            if (ride.getRequester() != null) {
                Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
                ride.getRequester().setAverageRating(avgRating);
            }
        }

        return filteredRides;
    }

    private boolean canAccommodateJourney(RideRequest ride, String origin, String destination) {
        // Build the complete route with both city and point information
        List<RoutePoint> fullPath = new ArrayList<>();

        // Add origin
        fullPath.add(new RoutePoint(ride.getOriginCity(), ride.getOrigin()));

        // Add all stopovers
        if (ride.getStopovers() != null) {
            for (Stopover stopover : ride.getStopovers()) {
                fullPath.add(new RoutePoint(stopover.getCity(), stopover.getPoint()));
            }
        }

        // Add destination
        fullPath.add(new RoutePoint(ride.getDestinationCity(), ride.getDestination()));

        // LOG THE FULL PATH
        logger.info("=== Checking ride ID: {} ===", ride.getId());
        logger.info("Full route path:");
        for (int i = 0; i < fullPath.size(); i++) {
            logger.info("  [{}] City: '{}', Point: '{}'", i, fullPath.get(i).getCity(), fullPath.get(i).getPoint());
        }
        logger.info("Searching for journey: '{}' -> '{}'", origin, destination);

        int originIndex = -1;
        int destinationIndex = -1;

        // Find the FIRST occurrence of origin
        for (int i = 0; i < fullPath.size(); i++) {
            if (matchesLocation(fullPath.get(i), origin)) {
                originIndex = i;
                logger.info("✓ Found origin '{}' at index {}", origin, i);
                break;
            }
        }

        // If origin not found, return false
        if (originIndex == -1) {
            logger.info("✗ Origin '{}' NOT FOUND in route", origin);
            return false;
        }

        // Find the FIRST occurrence of destination AFTER the origin
        for (int i = originIndex + 1; i < fullPath.size(); i++) {
            if (matchesLocation(fullPath.get(i), destination)) {
                destinationIndex = i;
                logger.info("✓ Found destination '{}' at index {}", destination, i);
                break;
            }
        }

        if (destinationIndex == -1) {
            logger.info("✗ Destination '{}' NOT FOUND after origin", destination);
        }

        boolean result = originIndex != -1 && destinationIndex != -1 && destinationIndex > originIndex;
        logger.info("=== Journey possible: {} ===\n", result);
        return result;
    }

    /**
     * Helper method to check if a route point matches a search location.
     * Uses flexible matching to handle variations in location naming.
     */
    private boolean matchesLocation(RoutePoint routePoint, String searchLocation) {
        if (searchLocation == null || searchLocation.trim().isEmpty()) {
            return false;
        }

        String searchLower = normalizeLocation(searchLocation);
        String cityLower = normalizeLocation(routePoint.getCity());
        String pointLower = normalizeLocation(routePoint.getPoint());

        logger.debug("  Comparing search='{}' with city='{}', point='{}'", searchLower, cityLower, pointLower);

        // Try exact match first
        if (cityLower.equals(searchLower) || pointLower.equals(searchLower)) {
            logger.debug("  -> EXACT match found");
            return true;
        }

        // Check if search term is contained in city or point
        if (cityLower.contains(searchLower) || pointLower.contains(searchLower)) {
            logger.debug("  -> PARTIAL match found (search in location)");
            return true;
        }

        // Check if city or point is contained in search term
        if (!cityLower.isEmpty() && searchLower.contains(cityLower)) {
            logger.debug("  -> PARTIAL match found (location in search)");
            return true;
        }

        // Extract main city names and compare (handles "Mumbai, Maharashtra, India" vs "Mumbai")
        String searchMainCity = extractMainCity(searchLocation);
        String cityMainCity = extractMainCity(routePoint.getCity());
        String pointMainCity = extractMainCity(routePoint.getPoint());

        if (searchMainCity.length() >= 3) {
            if (cityMainCity.equals(searchMainCity) || pointMainCity.contains(searchMainCity) ||
                    cityMainCity.contains(searchMainCity) || searchMainCity.contains(cityMainCity)) {
                logger.debug("  -> MAIN CITY match found: search='{}', city='{}', point='{}'",
                        searchMainCity, cityMainCity, pointMainCity);
                return true;
            }
        }

        logger.debug("  -> NO match");
        return false;
    }

    /**
     * Normalizes a location string for comparison
     */
    private String normalizeLocation(String location) {
        if (location == null) return "";
        return location.toLowerCase()
                .trim()
                .replaceAll("\\s+", " ");
    }

    /**
     * Extracts the main city name from a full address
     * E.g., "Mumbai, Maharashtra, India" -> "mumbai"
     * E.g., "IIT Bombay, Main Gate Road, Mumbai" -> "mumbai"
     */
    private String extractMainCity(String location) {
        if (location == null || location.isEmpty()) return "";

        String normalized = normalizeLocation(location);

        // Common patterns: "City, State, Country" or "Place, City, State"
        // We want to extract the main city name

        // Split by comma and clean each part
        String[] parts = normalized.split(",");

        // Look for recognizable city names in the parts
        for (String part : parts) {
            part = part.trim();

            // Skip very short parts
            if (part.length() < 3) continue;

            // Skip common state/country names
            if (part.equals("india") || part.equals("andhra pradesh") ||
                    part.equals("tamil nadu") || part.equals("maharashtra") ||
                    part.equals("kerala")) {
                continue;
            }

            // If we find a part that contains a known city name, extract it
            if (part.contains("mumbai")) return "mumbai";
            if (part.contains("chennai")) return "chennai";
            if (part.contains("tirupati")) return "tirupati";
            if (part.contains("kerala")) return "kerala";
            if (part.contains("bangalore")) return "bangalore";
            if (part.contains("hyderabad")) return "hyderabad";
            if (part.contains("delhi")) return "delhi";
            if (part.contains("kolkata")) return "kolkata";
        }

        // If no known city found, return the first substantial part
        for (String part : parts) {
            part = part.trim();
            if (part.length() >= 3 &&
                    !part.equals("india") &&
                    !part.startsWith("iit") &&
                    !part.contains("institute")) {
                return part;
            }
        }

        return normalized;
    }

    /**
     * Inner class to hold route point information
     */
    private static class RoutePoint {
        private final String city;
        private final String point;

        public RoutePoint(String city, String point) {
            this.city = city;
            this.point = point;
        }

        public String getCity() {
            return city;
        }

        public String getPoint() {
            return point;
        }

        @Override
        public String toString() {
            return "RoutePoint{city='" + city + "', point='" + point + "'}";
        }
    }
    @Transactional
    public RideRequest createRideOffer(RideRequestDTO rideRequestDTO, String requesterEmail) {
        Employee requester = employeeRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + requesterEmail));

        RideRequest newRideOffer = new RideRequest();
        newRideOffer.setOriginCity(rideRequestDTO.getOriginCity());
        newRideOffer.setOrigin(rideRequestDTO.getOrigin());
        newRideOffer.setDestinationCity(rideRequestDTO.getDestinationCity());
        newRideOffer.setDestination(rideRequestDTO.getDestination());
        newRideOffer.setTravelDateTime(rideRequestDTO.getTravelDateTime());
        newRideOffer.setStatus("PENDING");
        newRideOffer.setRequester(requester);
        newRideOffer.setRideType("OFFERED");
        newRideOffer.setVehicleModel(rideRequestDTO.getVehicleModel());
        newRideOffer.setVehicleCapacity(rideRequestDTO.getVehicleCapacity());
        newRideOffer.setGenderPreference(rideRequestDTO.getGenderPreference());
        newRideOffer.setPrice(rideRequestDTO.getPrice());
        newRideOffer.setDriverNote(rideRequestDTO.getDriverNote());
        newRideOffer.setStopoverPrices(rideRequestDTO.getStopoverPrices());

        if (rideRequestDTO.getStops() != null) {
            List<Stopover> stopoverEntities = rideRequestDTO.getStops().stream()
                    .map(dto -> {
                        Stopover stopover = new Stopover();
                        stopover.setCity(dto.getCity());
                        stopover.setPoint(dto.getPoint());
                        stopover.setRideRequest(newRideOffer);

                        // NEW: Geocode the stop point
                        try {
                            LatLng location = googleMapsService.geocodeAddress(dto.getPoint());
                            if (location != null) {
                                stopover.setLat(location.lat);
                                stopover.setLng(location.lng);
                            }
                        } catch (Exception e) {
                            logger.error("Could not geocode stopover point: {}", dto.getPoint(), e);
                        }

                        return stopover;
                    })
                    .collect(Collectors.toList());
            newRideOffer.setStopovers(stopoverEntities);
        }

        String[] stopsArray = (rideRequestDTO.getStops() != null)
                ? rideRequestDTO.getStops().stream().map(StopoverDto::getPoint).toArray(String[]::new)
                : new String[0];

        TravelInfo travelInfo = googleMapsService.getTravelInfo(rideRequestDTO.getOrigin(), rideRequestDTO.getDestination(), stopsArray);

        newRideOffer.setDuration(travelInfo.getDurationInMinutes());
        newRideOffer.setDistance(travelInfo.getDistanceInKm());
        newRideOffer.setRoutePolyline(travelInfo.getPolyline());

        if (travelInfo.getDistanceInKm() > 0 && rideRequestDTO.getPrice() != null && rideRequestDTO.getPrice() > 0) {
            newRideOffer.setPricePerKm(rideRequestDTO.getPrice() / travelInfo.getDistanceInKm());
        } else {
            newRideOffer.setPricePerKm(0.0);
        }

        return rideRequestRepository.save(newRideOffer);
    }

    @Transactional
    public void deleteRide(Long rideId, String userEmail) {
        RideRequest ride = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee user = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        if (!Objects.equals(ride.getRequester().getId(), user.getId())) {
            throw new IllegalStateException("You are not authorized to delete this ride.");
        }

        logger.info("Authorization successful. Deleting ride ID: {}", rideId);
        rideRequestRepository.delete(ride);
    }

    @Transactional
    public RideParticipant joinRideRequest(Long rideId, String participantEmail, Map<String, Object> segmentDetails) {
        RideRequest rideRequest = rideRequestRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + rideId));

        Employee participant = employeeRepository.findByEmail(participantEmail)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + participantEmail));

        String pickupPoint = (String) segmentDetails.get("pickupPoint");
        String dropoffPoint = (String) segmentDetails.get("dropoffPoint");
        Double price = ((Number) segmentDetails.get("price")).doubleValue();

        if (pickupPoint == null || dropoffPoint == null || price == null) {
            throw new IllegalStateException("Pickup point, drop-off point, and price must be provided.");
        }

        List<String> fullRoute = new ArrayList<>();
        fullRoute.add(rideRequest.getOrigin());
        // FIX: Use getStopovers() and extract the point from each Stopover object
        if (rideRequest.getStopovers() != null) {
            fullRoute.addAll(rideRequest.getStopovers().stream().map(Stopover::getPoint).collect(Collectors.toList()));
        }
        fullRoute.add(rideRequest.getDestination());

        int pickupIndex = fullRoute.indexOf(pickupPoint);
        int dropoffIndex = fullRoute.indexOf(dropoffPoint);

        if (pickupIndex == -1 || dropoffIndex == -1) {
            throw new IllegalStateException("Invalid pickup or drop-off point. Must be part of the route.");
        }

        if (pickupIndex >= dropoffIndex) {
            throw new IllegalStateException("Pickup point must be before drop-off point.");
        }

        if (!"OFFERED".equalsIgnoreCase(rideRequest.getRideType())) {
            throw new IllegalStateException("You can only join offered rides.");
        }

        if ("FEMALE_ONLY".equalsIgnoreCase(rideRequest.getGenderPreference()) &&
                !"FEMALE".equalsIgnoreCase(participant.getGender())) {
            throw new IllegalStateException("This ride is for female participants only.");
        }

        if (rideRequest.getVehicleCapacity() - rideRequest.getParticipants().size() < 1) {
            throw new IllegalStateException("This ride is already full.");
        }

        if (rideRequest.getRequester().equals(participant)) {
            throw new IllegalStateException("You cannot join a ride that you posted.");
        }

        if (rideParticipantRepository.existsByRideRequestAndParticipant(rideRequest, participant)) {
            throw new IllegalStateException("You have already joined this ride.");
        }

        RideParticipant rideParticipant = new RideParticipant();
        rideParticipant.setRideRequest(rideRequest);
        rideParticipant.setParticipant(participant);
        rideParticipant.setPickupPoint(pickupPoint);
        rideParticipant.setDropoffPoint(dropoffPoint);
        rideParticipant.setPrice(price);

        return rideParticipantRepository.save(rideParticipant);
    }

    public List<RideRequest> getRidesForUser(String userEmail) {
        Employee employee = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<RideRequest> userRides = rideRequestRepository.findAll().stream()
                .filter(ride -> ride.getRequester().equals(employee) ||
                        (ride.getParticipants() != null && ride.getParticipants().stream()
                                .anyMatch(p -> p.getParticipant().equals(employee))))
                .collect(Collectors.toList());
        for (RideRequest ride : userRides) {
            if (ride.getRequester() != null) {
                Double avgRating = ratingService.calculateAverageRating(ride.getRequester().getId());
                ride.getRequester().setAverageRating(avgRating);
            }
        }
        return userRides;
    }
}