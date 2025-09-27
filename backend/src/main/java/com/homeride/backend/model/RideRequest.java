package com.homeride.backend.model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ride_requests")
public class RideRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String origin;
    @Column(nullable = false)
    private String destination;

    @ElementCollection
    @CollectionTable(name = "ride_stops", joinColumns = @JoinColumn(name = "ride_request_id"))
    @Column(name = "stop")
    private List<String> stops;

    @Column(nullable = false)
    private String rideType;
    @Column(nullable = false)
    private LocalDateTime travelDateTime;
    private String status;
    // NEW: Added vehicle model (can be null if it's a request)
    private String vehicleModel;
    // NEW: Added vehicle capacity (can be null if it's a request)
    private Integer vehicleCapacity;
    // NEW: Added gender preference (e.g., "ALL", "FEMALE_ONLY")
    private String genderPreference;
    @ManyToOne
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester;
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Employee driver;
    @OneToMany(mappedBy = "rideRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<RideParticipant> participants;
}
