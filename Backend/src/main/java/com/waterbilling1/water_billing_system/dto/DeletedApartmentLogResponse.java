package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DeletedApartmentLogResponse {
    private Long id;
    private String adminFullName;
    private String adminEmail;
    private String apartmentName;
    private String city;
    private LocalDateTime deletedAt;
}