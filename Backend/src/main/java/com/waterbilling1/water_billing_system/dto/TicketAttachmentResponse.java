package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TicketAttachmentResponse {
    private Long id;
    private String fileName;
    private String fileUrl;
}