package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MeterReadingResponse {
    private Long id;
    private String householdUserName;
    private String flatNumber;
    private Double previousReading;
    private Double currentReading;
    private Double usageUnits;
    private String billingCycle;
    private LocalDate readingDate;
}