package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "alerts")
public class Alert extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = false)
    private HouseholdUser householdUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(nullable = false, length = 30)
    private String alertType; // THRESHOLD_EXCEEDED or LEAK_SUSPECTED

    @Column(nullable = false, length = 255)
    private String message;

    @Column(nullable = false)
    private Double triggerValue;

    @Builder.Default
    @Column(nullable = false)
    private Boolean resolved = false;

    @Column(nullable = false)
    private LocalDateTime triggeredAt;


    @Column(length = 20)
    private String billingCycle;

    private Long meterReadingId;

}