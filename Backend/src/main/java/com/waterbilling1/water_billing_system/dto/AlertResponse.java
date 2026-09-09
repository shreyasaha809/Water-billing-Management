package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AlertResponse {
    private Long id;
    private String householdName;
    private String flatNumber;
    private String alertType;
    private String message;
    private Double triggerValue;
    private Boolean resolved;
    private LocalDateTime triggeredAt;
}