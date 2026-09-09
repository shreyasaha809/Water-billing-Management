package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GenerateBillRequest {

    @NotNull(message = "Household user is required")
    private Long householdUserId;

    @NotBlank(message = "Billing cycle is required (e.g. JUL-2026)")
    private String billingCycle;

    private LocalDate billGeneratedDate;
}