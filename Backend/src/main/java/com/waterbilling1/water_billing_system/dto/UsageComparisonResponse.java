package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UsageComparisonResponse {
    private Double userUsage;
    private Double averageUsage;
    private Double difference;
    private Double percentage;
    private String status; // ABOVE_AVERAGE, BELOW_AVERAGE, NORMAL
}