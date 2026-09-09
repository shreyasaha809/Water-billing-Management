package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "tariff_plans")
public class TariffPlan extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false, unique = true)
    private Apartment apartment;

    @Builder.Default
    @Column(nullable = false)
    private Double baseTierLimitLiters = 10000.0; // 10 kL default

    @Builder.Default
    @Column(nullable = false)
    private Double baseRate = 0.20; // ₹ per liter, first tier

    @Builder.Default
    @Column(nullable = false)
    private Double higherRate = 0.35; // ₹ per liter, beyond tier limit

    @Builder.Default
    @Column(nullable = false)
    private Double lateFeeAmount = 100.0; // ₹ flat fee, applied every lateFeeIntervalDays overdue

    @Builder.Default
    @Column(nullable = false)
    private Integer lateFeeIntervalDays = 30; // number of overdue days between each late fee application

}