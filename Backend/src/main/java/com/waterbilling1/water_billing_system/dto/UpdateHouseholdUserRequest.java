package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpdateHouseholdUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Phone number must be a valid 10-digit number")
    private String phoneNumber;

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    // Optional — defaults to the household's current status when omitted.
    private String status;
}
