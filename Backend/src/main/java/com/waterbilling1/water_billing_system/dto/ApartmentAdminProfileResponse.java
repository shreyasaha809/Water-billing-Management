package com.waterbilling1.water_billing_system.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApartmentAdminProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String apartmentName;
    private String apartmentAddress;
    private String city;
    private String state;
    private String pinCode;
}