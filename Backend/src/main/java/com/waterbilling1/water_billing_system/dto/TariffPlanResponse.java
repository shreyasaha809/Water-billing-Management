package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TariffPlanResponse {
    private Long id;
    private Double baseTierLimitLiters;
    private Double baseRate;
    private Double higherRate;
    private Double lateFeeAmount;
    private Integer lateFeeIntervalDays;
}