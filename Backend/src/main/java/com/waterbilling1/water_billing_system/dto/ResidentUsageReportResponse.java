package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ResidentUsageReportResponse {
    private String apartmentName;
    private String billingCycle;
    private LocalDateTime generatedAt;
    private Double totalUsage;
    private Double averageUsage;
    private List<ResidentUsageReportRow> rows;
}