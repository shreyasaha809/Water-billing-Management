package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DistributionResult {
    private Long householdUserId;
    private String householdName;
    private String flatNumber;
    private Double meteredUsageLiters;
    private Double allocatedCost;
    private String allocationMethod; // PROPORTIONAL or FLAT_FALLBACK
}