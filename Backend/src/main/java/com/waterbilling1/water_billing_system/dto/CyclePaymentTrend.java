package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CyclePaymentTrend {
    private String billingCycle;
    private double totalBilled;
    private double totalCollected;
    private int billCount;
}