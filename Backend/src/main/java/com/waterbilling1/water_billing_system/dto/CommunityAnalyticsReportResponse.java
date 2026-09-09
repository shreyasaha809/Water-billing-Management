package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityAnalyticsReportResponse {
    private String apartmentName;
    private LocalDateTime generatedAt;
    private int totalResidents;
    private double totalConsumptionAllTime;
    private double averageConsumptionPerHousehold;
    private double currentCycleConsumption;
    private double previousCycleConsumption;
    private double consumptionChangePercent; // positive = growth, negative = decline
    private int totalWaterPurchasedLiters;
    private double totalWaterPurchaseCost;
    private int totalSupportTickets;
    private int totalAnnouncements;
}