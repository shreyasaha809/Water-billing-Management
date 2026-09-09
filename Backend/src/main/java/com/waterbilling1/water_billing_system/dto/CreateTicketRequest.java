package com.waterbilling1.water_billing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreateTicketRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    // Optional — defaults to MEDIUM in the service layer when not supplied.
    @Pattern(regexp = "HIGH|MEDIUM|LOW", message = "Priority must be one of HIGH, MEDIUM, LOW")
    private String priority;
}