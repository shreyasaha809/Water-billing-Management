package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BillingCycleResponse {
    private Long id;
    private String cycleName;
    private String status;
    private LocalDateTime openedAt;
    private LocalDateTime finalizedAt;
    private int billsGenerated;
    private String warning;
}