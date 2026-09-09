package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatRequest {
    @NotBlank(message = "Message is required")
    private String message;

    private String currentPage; // e.g. "billing", "support", "announcements"
}