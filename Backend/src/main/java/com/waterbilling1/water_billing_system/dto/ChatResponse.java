package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatResponse {
    private String reply;
    private String suggestedNavigation; // e.g. "billing", null if none
}