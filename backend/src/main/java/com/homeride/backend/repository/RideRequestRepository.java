package com.homeride.backend.repository;
import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.criteria.JoinType;
@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long>, JpaSpecificationExecutor<RideRequest> {
    long countByRequester(Employee requester);
    @Query("SELECT r FROM RideRequest r WHERE r.travelDateTime > :cutoffTime")
    List<RideRequest> findActiveRides(@Param("cutoffTime") LocalDateTime cutoffTime);
    class Ridespecs {
        public static Specification<RideRequest> hasOrigin(String origin) {
            return (root, query, cb) -> cb.like(cb.lower(root.get("origin")), "%" + origin.toLowerCase() + "%");
        }
        public static Specification<RideRequest> hasDestination(String destination) {
            return (root, query, cb) -> cb.like(cb.lower(root.get("destination")), "%" + destination.toLowerCase() + "%");
        }
        public static Specification<RideRequest> isAfterCutoffTime(LocalDateTime cutoffTime) {
            return (root, query, cb) -> cb.greaterThan(root.get("travelDateTime"), cutoffTime);
        }
        // NEW: Filter by a specific travel date/time
        public static Specification<RideRequest> isAfterDate(LocalDateTime travelDateTime) {
            return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("travelDateTime"), travelDateTime);
        }
        // NEW: Filter for rides with enough available seats
        public static Specification<RideRequest> hasCapacityFor(int passengerCount) {
            return (root, query, cb) -> {
                // We need to fetch participants to get the current count.
                // This is an eager fetch to avoid N+1 queries.
                root.fetch("participants", JoinType.LEFT);
                query.distinct(true);
                return cb.greaterThanOrEqualTo(
                        cb.diff(
                                root.get("vehicleCapacity"),
                                cb.size(root.get("participants"))
                        ),
                        passengerCount
                );
            };
        }
    }
}