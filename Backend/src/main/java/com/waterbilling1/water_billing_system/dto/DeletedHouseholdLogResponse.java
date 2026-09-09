package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeletedHouseholdLogResponse {
    private Long id;
    private String fullName;
    private String email;
    private String flatNumber;
    private LocalDateTime deletedAt;
}