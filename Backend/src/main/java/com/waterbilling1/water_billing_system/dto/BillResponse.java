package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillResponse {
    private Long id;
    private String billNumber;
    private String householdUserName;
    private String flatNumber;
    private String billingCycle;
    private Double usageUnits;
    private Double ratePerUnit;
    private Double amount;
    private String status;
    private LocalDateTime generatedDate;
    private LocalDateTime dueDate;
    private Double tier1Usage;
    private Double tier1Rate;
    private Double tier1Amount;
    private Double tier2Usage;
    private Double tier2Rate;
    private Double tier2Amount;
    private Double extraChargeAmount;
    private Double lateFeeAmount;
    private Integer lateFeeCount;
}