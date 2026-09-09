package com.waterbilling1.water_billing_system.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketMessageResponse {
    private Long id;
    private String senderRole;
    private String senderName;
    private String message;
    private Boolean isInternalNote;
    private LocalDateTime createdAt;
    private List<TicketAttachmentResponse> attachments;
}