package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "support_tickets")
public class SupportTicket extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String ticketNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    // Nullable: tickets raised directly by an Apartment Admin (see raisedByAdmin below)
    // have no household user attached.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = true)
    private HouseholdUser householdUser;

    // Set only when this ticket was raised by an Apartment Admin (rather than a resident),
    // e.g. sent directly to the Super Admin.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raised_by_admin_id")
    private ApartmentAdmin raisedByAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private ApartmentAdmin assignedAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_super_admin_id")
    private SuperAdmin assignedSuperAdmin;

    @Column(nullable = false, length = 30)
    private String category; // BILLING, WATER_METER, WATER_LEAKAGE, COMPLAINT, TECHNICAL_ISSUE, OTHER

    @Builder.Default
    @Column(nullable = false, length = 10)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String status = "PENDING"; // PENDING, ACCEPTED, IN_PROGRESS, ESCALATED, WAITING_FOR_USER, RESOLVED, CLOSED

    private LocalDateTime resolvedAt;

    // Set once, the first time this ticket reaches the Super Admin (either escalated by an
    // Apartment Admin, or raised directly to the Super Admin) and never cleared afterward.
    // This is what keeps the ticket visible in the Super Admin's list even after its status
    // later changes to IN_PROGRESS / WAITING_FOR_USER / RESOLVED / CLOSED.
    private LocalDateTime escalatedAt;
}