package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.DeletedApartmentLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeletedApartmentLogRepository extends JpaRepository<DeletedApartmentLog, Long> {
    List<DeletedApartmentLog> findAllByOrderByDeletedAtDesc();
}