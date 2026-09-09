package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
}