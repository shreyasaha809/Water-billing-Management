package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "announcement_reads",
        uniqueConstraints = @UniqueConstraint(columnNames = {"announcement_id", "household_user_id"}))
public class AnnouncementRead extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = false)
    private HouseholdUser householdUser;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isRead = false;

    private LocalDateTime readAt;
}