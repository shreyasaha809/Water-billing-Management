package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateOrderRequest {
    @NotNull(message = "Bill ID is required")
    private Long billId;
}