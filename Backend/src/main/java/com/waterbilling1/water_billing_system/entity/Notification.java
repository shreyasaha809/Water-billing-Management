package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "notifications")
public class Notification extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id")
    private HouseholdUser householdUser; // nullable now — set only for household-targeted notifications

    private Long recipientId; // set for APARTMENT_ADMIN / SUPER_ADMIN notifications

    @Column(length = 20)
    private String recipientRole; // HOUSEHOLD_USER, APARTMENT_ADMIN, SUPER_ADMIN

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false, length = 20)
    private String type; // INFO, SUCCESS, WARNING, ERROR

    @Builder.Default
    @Column(nullable = false)
    private Boolean isRead = false;
}