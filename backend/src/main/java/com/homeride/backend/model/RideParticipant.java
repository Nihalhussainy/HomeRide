package com.homeride.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ride_participants")
public class RideParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ride_request_id", nullable = false)
    @JsonBackReference // CORRECTED: Changed from @JsonIgnore
    private RideRequest rideRequest;

    @ManyToOne
    @JoinColumn(name = "participant_id", nullable = false)
    private Employee participant;

    @Column(updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
