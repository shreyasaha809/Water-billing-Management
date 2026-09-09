package com.waterbilling1.water_billing_system.dto;

import com.waterbilling1.water_billing_system.entity.ApartmentAdmin.ApprovalStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApartmentAdminSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Long apartmentId;
    private String apartmentName;
    private String city;
    private String state;
    private ApprovalStatus status;
    private LocalDateTime createdAt;
}