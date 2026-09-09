package com.waterbilling1.water_billing_system.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String createdByName;
    private LocalDate publishDate;
    private LocalDate expiryDate;
    private Boolean isActive;
    private Boolean isExpired;
    private Boolean isRead; // only populated for household-facing responses
    private LocalDateTime createdAt;
}