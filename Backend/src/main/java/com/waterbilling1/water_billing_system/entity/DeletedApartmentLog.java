package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "deleted_apartment_logs")
public class DeletedApartmentLog {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String adminFullName;

    @Column(nullable = false, length = 150)
    private String adminEmail;

    @Column(nullable = false, length = 150)
    private String apartmentName;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false)
    private LocalDateTime deletedAt;
}
