package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HouseholdCredentialsEmailRequest {
    private String toEmail;
    private String rawPassword;
}