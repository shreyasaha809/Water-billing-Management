package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "billing_cycles", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"apartment_id", "cycle_name"})
})
public class BillingCycle extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(name = "cycle_name", nullable = false, length = 20)
    private String cycleName;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "OPEN"; // OPEN, FINALIZED, ARCHIVED

    @Column(nullable = false)
    private LocalDateTime openedAt;

    private LocalDateTime finalizedAt;


}