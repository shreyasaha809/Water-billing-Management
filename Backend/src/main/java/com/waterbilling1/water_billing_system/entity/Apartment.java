package com.waterbilling1.water_billing_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "apartments")
public class Apartment extends BaseEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Apartment name is required")
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String apartmentName;

    @NotBlank(message = "Apartment address is required")
    @Column(nullable = false, length = 255)
    private String address;

    @NotBlank(message = "City is required")
    @Column(nullable = false, length = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Column(nullable = false, length = 100)
    private String state;

    @NotBlank(message = "PIN code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be 6 digits")
    @Column(nullable = false, length = 6)
    private String pinCode;

    @OneToOne(mappedBy = "apartment", cascade = CascadeType.ALL)
    private ApartmentAdmin apartmentAdmin;
}