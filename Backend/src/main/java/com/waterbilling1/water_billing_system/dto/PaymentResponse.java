package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Long id;
    private Long billId;
    private String billNumber;
    private String paymentMethod;
    private String paymentStatus;
    private Double amountPaid;
    private LocalDateTime paymentDate;
}