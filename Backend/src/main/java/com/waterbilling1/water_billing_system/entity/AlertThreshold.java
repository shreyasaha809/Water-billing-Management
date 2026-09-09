package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "alert_thresholds")
public class AlertThreshold extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false, unique = true)
    private Apartment apartment;

    @Builder.Default
    @Column(nullable = false)
    private Double dailyUsageThresholdLiters = 500.0;
}