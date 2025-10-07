package com.homeride.backend.repository;

import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long>, JpaSpecificationExecutor<RideRequest> {

    // FIXED: Removed "stops" from EntityGraph - stops is @ElementCollection, not an entity relationship
    @Override
    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    List<RideRequest> findAll();

    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    List<RideRequest> findAll(Specification<RideRequest> spec);

    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    Optional<RideRequest> findById(Long id);

    // Custom query methods for location-based searching
    @Query("SELECT r FROM RideRequest r WHERE " +
            "(LOWER(r.origin) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
            "LOWER(r.destination) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
            "EXISTS (SELECT s FROM r.stops s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :location, '%'))))")
    List<RideRequest> findByLocationInPath(@Param("location") String location);

    @Query("SELECT r FROM RideRequest r WHERE " +
            "((LOWER(r.origin) LIKE LOWER(CONCAT('%', :origin, '%')) OR " +
            "EXISTS (SELECT s FROM r.stops s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :origin, '%')))) AND " +
            "(LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%')) OR " +
            "EXISTS (SELECT s FROM r.stops s WHERE LOWER(s) LIKE LOWER(CONCAT('%', :destination, '%')))))")
    List<RideRequest> findByOriginAndDestinationInPath(@Param("origin") String origin, @Param("destination") String destination);

    long countByRequester(Employee requester);
    long countByDriver(Employee driver);

    interface Ridespecs {

        static Specification<RideRequest> hasOrigin(String origin) {
            return (root, query, cb) -> cb.like(cb.lower(root.get("origin")), "%" + origin.toLowerCase() + "%");
        }

        static Specification<RideRequest> hasDestination(String destination) {
            return (root, query, cb) -> cb.like(cb.lower(root.get("destination")), "%" + destination.toLowerCase() + "%");
        }

        // Simple specification for stops matching
        static Specification<RideRequest> hasStop(String stop) {
            return (root, query, cb) -> {
                return cb.isMember(stop, root.get("stops"));
            };
        }

        // New specification that checks if a location appears anywhere in the ride path
        static Specification<RideRequest> passesThrough(String location) {
            return (root, query, cb) -> {
                return cb.or(
                        cb.like(cb.lower(root.get("origin")), "%" + location.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("destination")), "%" + location.toLowerCase() + "%"),
                        cb.exists(
                                query.subquery(String.class)
                                        .select(cb.literal("1"))
                                        .where(cb.like(cb.lower(root.join("stops")), "%" + location.toLowerCase() + "%"))
                        )
                );
            };
        }

        // Specification to check if a ride can accommodate a journey from origin to destination
        static Specification<RideRequest> canAccommodateJourney(String origin, String destination) {
            return (root, query, cb) -> {
                return cb.and(
                        cb.or(
                                cb.like(cb.lower(root.get("origin")), "%" + origin.toLowerCase() + "%"),
                                cb.like(cb.lower(root.get("destination")), "%" + origin.toLowerCase() + "%"),
                                cb.exists(
                                        query.subquery(String.class)
                                                .select(cb.literal("1"))
                                                .where(cb.like(cb.lower(root.join("stops")), "%" + origin.toLowerCase() + "%"))
                                )
                        ),
                        cb.or(
                                cb.like(cb.lower(root.get("origin")), "%" + destination.toLowerCase() + "%"),
                                cb.like(cb.lower(root.get("destination")), "%" + destination.toLowerCase() + "%"),
                                cb.exists(
                                        query.subquery(String.class)
                                                .select(cb.literal("1"))
                                                .where(cb.like(cb.lower(root.join("stops")), "%" + destination.toLowerCase() + "%"))
                                )
                        )
                );
            };
        }

        static Specification<RideRequest> isOfferedRide() {
            return (root, query, cb) -> cb.equal(root.get("rideType"), "OFFERED");
        }

        static Specification<RideRequest> isRequestedRide() {
            return (root, query, cb) -> cb.equal(root.get("rideType"), "REQUESTED");
        }

        static Specification<RideRequest> hasCapacityFor(Integer passengerCount) {
            return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("vehicleCapacity"), passengerCount);
        }

        static Specification<RideRequest> isAfterCutoffTime(LocalDateTime dateTime) {
            return (root, query, cb) -> cb.greaterThan(root.get("travelDateTime"), dateTime);
        }

        // Additional helper specifications
        static Specification<RideRequest> isPending() {
            return (root, query, cb) -> cb.equal(root.get("status"), "PENDING");
        }

        static Specification<RideRequest> isConfirmed() {
            return (root, query, cb) -> cb.equal(root.get("status"), "CONFIRMED");
        }

        static Specification<RideRequest> hasFemaleOnlyPreference() {
            return (root, query, cb) -> cb.equal(root.get("genderPreference"), "FEMALE_ONLY");
        }
    }
}