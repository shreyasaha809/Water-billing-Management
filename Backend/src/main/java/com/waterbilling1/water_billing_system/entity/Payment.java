package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "payments")
public class Payment extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_user_id", nullable = false)
    private HouseholdUser householdUser;

    @Column(nullable = false, length = 20)
    private String paymentMethod; // ONLINE or CASH

    @Column(nullable = false, length = 20)
    private String paymentStatus; // SUCCESS, PENDING, FAILED

    @Column(nullable = false)
    private Double amountPaid;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @Column(length = 60)
    private String razorpayOrderId;

    @Column(length = 60)
    private String razorpayPaymentId;
}
