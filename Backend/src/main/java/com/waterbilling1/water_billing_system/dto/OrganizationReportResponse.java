package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrganizationReportResponse {
    private LocalDateTime generatedAt;
    private int totalCommunities;
    private int totalResidents;
    private int totalAdmins;
    private double totalRevenue;
    private double totalBilledAmount;
    private double totalConsumption;
    private int totalSupportTickets;
    private int escalatedTickets;
    private int activeResidents;
    private int inactiveResidents;
    private int paidBills;
    private int unpaidBills;
    private double outstandingAmount;
    private int openTickets;
    private int resolvedTickets;
    private List<CommunityComparisonRow> communities;
}