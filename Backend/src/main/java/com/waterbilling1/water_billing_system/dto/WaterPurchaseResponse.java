package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WaterPurchaseResponse {
    private Long id;
    private String billingCycle;
    private String sourceType;
    private Double volumePurchasedLiters;
    private Double unitCost;
    private Double totalCost;
    private LocalDate purchaseDate;
}