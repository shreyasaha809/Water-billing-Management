package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResidentUsageReportRow {
    private String householdName;
    private String flatNumber;
    private Double totalUsage;
    private Double totalBilled;
    private String rank; // "Highest", "Above Average", "Normal", "Lowest"
}