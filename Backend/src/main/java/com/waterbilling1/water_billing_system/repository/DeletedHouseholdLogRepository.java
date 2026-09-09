package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.DeletedHouseholdLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeletedHouseholdLogRepository extends JpaRepository<DeletedHouseholdLog, Long> {
    List<DeletedHouseholdLog> findByApartmentIdOrderByDeletedAtDesc(Long apartmentId);
}