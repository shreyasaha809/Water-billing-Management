package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillingCycleRepository extends JpaRepository<BillingCycle, Long> {
    List<BillingCycle> findByApartment_IdOrderByOpenedAtDesc(Long apartmentId);
    Optional<BillingCycle> findByApartment_IdAndCycleName(Long apartmentId, String cycleName);
}