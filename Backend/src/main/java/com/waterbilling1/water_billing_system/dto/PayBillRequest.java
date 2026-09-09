package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PayBillRequest {

    @NotNull(message = "Bill ID is required")
    private Long billId;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod; // ONLINE or CASH
}