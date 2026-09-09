package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateTicketStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;
}