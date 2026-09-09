package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "announcements")
public class Announcement extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id", nullable = false)
    private ApartmentAdmin createdBy;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 20)
    private String category; // WATER_SUPPLY, MAINTENANCE, BILLING, EMERGENCY, GENERAL

    @Column(nullable = false, length = 10)
    private String priority; // LOW, MEDIUM, HIGH, URGENT

    @Column(nullable = false)
    private LocalDate publishDate;

    private LocalDate expiryDate;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;
}