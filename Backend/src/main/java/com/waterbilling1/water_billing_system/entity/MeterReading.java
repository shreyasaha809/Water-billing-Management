package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "meter_readings")
public class MeterReading extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = false)
    private HouseholdUser householdUser;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(nullable = false)
    private Double previousReading;

    @Column(nullable = false)
    private Double currentReading;

    @Column(nullable = false)
    private Double usageUnits;

    @Column(nullable = false, length = 20)
    private String billingCycle;

    @Column(nullable = false)
    private LocalDate readingDate;
}
