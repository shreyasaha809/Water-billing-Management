package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HouseholdProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String flatNumber;
    private String apartmentName;
    private String apartmentAdminName;
    private String status;
}