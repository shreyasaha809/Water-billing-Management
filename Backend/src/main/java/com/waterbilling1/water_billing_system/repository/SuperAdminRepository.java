package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.SuperAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuperAdminRepository extends JpaRepository<SuperAdmin, Long> {
    Optional<SuperAdmin> findByEmail(String email);
    boolean existsByEmail(String email);
}