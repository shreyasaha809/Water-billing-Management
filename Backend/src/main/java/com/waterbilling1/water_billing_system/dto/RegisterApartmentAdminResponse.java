package com.waterbilling1.water_billing_system.dto;

import com.waterbilling1.water_billing_system.entity.ApartmentAdmin.ApprovalStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterApartmentAdminResponse {
    private Long apartmentAdminId;
    private String fullName;
    private String email;
    private String apartmentName;
    private ApprovalStatus status;
    private String message;
    private LocalDateTime registeredAt;
}