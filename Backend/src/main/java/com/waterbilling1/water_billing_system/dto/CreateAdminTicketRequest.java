package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateAdminTicketRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    // Optional — defaults to OTHER when not supplied.
    private String category;

    @NotBlank(message = "Priority is required")
    @Pattern(regexp = "HIGH|MEDIUM|LOW", message = "Priority must be one of HIGH, MEDIUM, LOW")
    private String priority;
}
