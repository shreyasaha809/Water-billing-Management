package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TariffPlanRequest {
    @NotNull @Positive private Double baseTierLimitLiters;
    @NotNull @Positive private Double baseRate;
    @NotNull @Positive private Double higherRate;
    @NotNull @Positive private Double lateFeeAmount;
    @NotNull @Positive private Integer lateFeeIntervalDays;
}