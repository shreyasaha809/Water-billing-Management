package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HouseholdUserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String flatNumber;
    private String status;
    private Long apartmentId;
    private String apartmentName;
    private LocalDateTime createdAt;
}