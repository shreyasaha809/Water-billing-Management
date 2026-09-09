package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AddTicketMessageRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private Boolean isInternalNote; // ignored for household requests; used by admin endpoints later
}