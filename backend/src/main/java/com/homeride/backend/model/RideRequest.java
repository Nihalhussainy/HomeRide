package com.homeride.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
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

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "ride_stops", joinColumns = @JoinColumn(name = "ride_request_id"))
    @Column(name = "stop")
    private List<String> stops = new ArrayList<>();

    @Column(nullable = false)
    private String rideType; // Will always be 'OFFERED'

    @Column(nullable = false)
    private LocalDateTime travelDateTime;

    private String status;
    private String vehicleModel;
    private Integer vehicleCapacity;
    private String genderPreference;
    private Double price;
    private Integer duration; // Duration in minutes
    private Double distance; // Distance in kilometers

    @Column(length = 1000) // NEW: Add this field with reasonable length
    private String driverNote; // Optional note from the driver

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private Employee requester; // This is the driver in an 'OFFERED' ride

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Employee driver;

    @OneToMany(mappedBy = "rideRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<RideParticipant> participants = new HashSet<>();
}