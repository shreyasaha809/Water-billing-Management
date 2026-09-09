package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.WaterPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaterPurchaseRepository extends JpaRepository<WaterPurchase, Long> {
    List<WaterPurchase> findByApartment_IdOrderByPurchaseDateDesc(Long apartmentId);
    List<WaterPurchase> findByApartment_IdAndBillingCycle(Long apartmentId, String billingCycle);
    List<WaterPurchase> findByApartment_Id(Long apartmentId);
}