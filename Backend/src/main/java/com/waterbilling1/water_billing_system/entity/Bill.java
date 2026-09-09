package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "bills")
public class Bill extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "meter_reading_id")
    private MeterReading meterReading;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = false)
    private HouseholdUser householdUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(nullable = false, length = 20)
    private String billingCycle;

    @Column(nullable = false)
    private Double usageUnits;

    @Column(nullable = false)
    private Double ratePerUnit;

    @Column(nullable = false)
    private Double tier1Usage;

    @Column(nullable = false)
    private Double tier1Rate;

    @Column(nullable = false)
    private Double tier1Amount;

    @Column(nullable = false)
    private Double tier2Usage;

    @Column(nullable = false)
    private Double tier2Rate;

    @Column(nullable = false)
    private Double tier2Amount;

    @Builder.Default
    @Column(nullable = false)
    private Double extraChargeAmount = 0.0;

    private LocalDateTime dueDate;

    @Builder.Default
    @Column(nullable = false)
    private Double lateFeeAmount = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private Integer lateFeeCount = 0; // how many 30-day penalty blocks have been applied so far

    private LocalDateTime lastLateFeeAppliedAt;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false, unique = true, length = 30)
    private String billNumber;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "GENERATED";

    @Column(nullable = false)
    private LocalDateTime generatedDate;
}