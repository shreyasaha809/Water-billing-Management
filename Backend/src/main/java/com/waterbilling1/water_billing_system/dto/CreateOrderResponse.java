package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateOrderResponse {
    private String razorpayOrderId;
    private Integer amountInPaise;
    private String currency;
    private String razorpayKeyId;
    private Long billId;
    private String billNumber;
}