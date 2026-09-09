package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityComparisonRow {
    private String apartmentName;
    private int residentCount;
    private double totalUsage;
    private double totalRevenue;
}