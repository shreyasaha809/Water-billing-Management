package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketDetailResponse {
    private Long id;
    private String ticketNumber;
    private String category;
    private String priority;
    private String title;
    private String description;
    private String status;
    private String householdName;
    private String flatNumber;
    private String raisedByAdminName;
    private String assignedAdminName;
    private String assignedSuperAdminName;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private List<TicketMessageResponse> messages;
    private List<TicketAttachmentResponse> ticketAttachments; // attached at creation time
}