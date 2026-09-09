package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin.ApprovalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApartmentAdminRepository extends JpaRepository<ApartmentAdmin, Long> {
    Optional<ApartmentAdmin> findByEmail(String email);
    boolean existsByEmail(String email);
    List<ApartmentAdmin> findByStatus(ApprovalStatus status);
    Optional<ApartmentAdmin> findByApartment_Id(Long apartmentId);
}