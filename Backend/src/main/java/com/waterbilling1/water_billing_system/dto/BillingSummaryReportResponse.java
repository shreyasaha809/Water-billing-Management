package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingSummaryReportResponse {
    private String apartmentName;
    private LocalDateTime generatedAt;
    private int totalBills;
    private int paidBills;
    private int unpaidBills;
    private int overdueBills;
    private double totalBilledAmount;
    private double totalCollected;
    private double totalOutstanding;
    private List<CyclePaymentTrend> cycleTrends;
}