package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecordWaterPurchaseRequest {
    @NotBlank private String billingCycle;
    @NotBlank private String sourceType; // TANKER / MUNICIPAL
    @NotNull @Positive private Double volumePurchasedLiters;
    @NotNull @Positive private Double unitCost;
    @NotNull private LocalDate purchaseDate;
}