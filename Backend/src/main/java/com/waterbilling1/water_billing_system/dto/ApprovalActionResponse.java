package com.waterbilling1.water_billing_system.dto;

import com.waterbilling1.water_billing_system.entity.ApartmentAdmin.ApprovalStatus;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalActionResponse {
    private Long apartmentAdminId;
    private String email;
    private ApprovalStatus status;
    private String message;
}
