package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SuperAdminProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String role;
}