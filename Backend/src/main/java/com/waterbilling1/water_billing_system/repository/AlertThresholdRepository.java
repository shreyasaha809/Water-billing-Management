package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.AlertThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AlertThresholdRepository extends JpaRepository<AlertThreshold, Long> {
    Optional<AlertThreshold> findByApartment_Id(Long apartmentId);
}