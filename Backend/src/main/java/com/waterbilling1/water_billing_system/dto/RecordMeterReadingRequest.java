package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecordMeterReadingRequest {

    @NotNull(message = "Household user is required")
    private Long householdUserId;

    @NotNull(message = "Current reading is required")
    private Double currentReading;

    @NotBlank(message = "Billing cycle is required (e.g. JUL-2026)")
    private String billingCycle;

    private LocalDate billGeneratedDate; // optional — if not provided, defaults to today
}