package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "ticket_messages")
public class TicketMessage extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private SupportTicket ticket;

    @Column(nullable = false, length = 20)
    private String senderRole; // HOUSEHOLD, APARTMENT_ADMIN, SUPER_ADMIN

    @Column(nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 100)
    private String senderName;

    @Column(nullable = false, length = 2000)
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isInternalNote = false; // true = admin-only note, hidden from household
}