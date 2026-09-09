package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketSummaryResponse {
    private Long id;
    private String ticketNumber;
    private String category;
    private String priority;
    private String title;
    private String status;
    private String householdName;
    private String flatNumber;
    private String raisedByAdminName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}