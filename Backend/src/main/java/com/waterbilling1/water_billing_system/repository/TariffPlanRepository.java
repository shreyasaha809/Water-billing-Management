package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.TariffPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TariffPlanRepository extends JpaRepository<TariffPlan, Long> {
    Optional<TariffPlan> findByApartment_Id(Long apartmentId);
}