package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "water_purchases")
public class WaterPurchase extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @Column(nullable = false, length = 20)
    private String billingCycle;

    @Column(nullable = false, length = 20)
    private String sourceType; // TANKER or MUNICIPAL

    @Column(nullable = false)
    private Double volumePurchasedLiters;

    @Column(nullable = false)
    private Double unitCost;

    @Column(nullable = false)
    private Double totalCost;

    @Column(nullable = false)
    private LocalDate purchaseDate;
}