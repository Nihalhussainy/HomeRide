package com.homeride.backend.repository;

import com.homeride.backend.model.Employee;
import com.homeride.backend.model.RideRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RideRequestRepository extends JpaRepository<RideRequest, Long>, JpaSpecificationExecutor<RideRequest> {

    // Use EntityGraph to eagerly fetch all related entities
    @Override
    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    List<RideRequest> findAll();

    // Use EntityGraph for any other find methods you use frequently
    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    List<RideRequest> findAll(Specification<RideRequest> spec);

    @EntityGraph(attributePaths = {"requester", "driver", "participants.participant"})
    Optional<RideRequest> findById(Long id);

    long countByRequester(Employee requester);
    long countByDriver(Employee driver);

    interface Ridespecs {
        static Specification<RideRequest> hasOrigin(String origin) {
            return (root, query, cb) -> cb.equal(root.get("origin"), origin);
        }
        static Specification<RideRequest> hasDestination(String destination) {
            return (root, query, cb) -> cb.equal(root.get("destination"), destination);
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
    }
}