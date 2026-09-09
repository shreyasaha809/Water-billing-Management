package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HouseholdUsageBarPoint {
    private String household;
    private Double usage;
    private String colorStatus; // NORMAL, ABOVE_AVERAGE, HIGHEST
}