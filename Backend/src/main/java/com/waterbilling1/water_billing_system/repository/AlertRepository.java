package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByApartment_IdOrderByTriggeredAtDesc(Long apartmentId);
    List<Alert> findByHouseholdUser_IdOrderByTriggeredAtDesc(Long householdUserId);
    boolean existsByHouseholdUser_IdAndAlertTypeAndBillingCycle(Long householdUserId, String alertType, String billingCycle);
    boolean existsByHouseholdUser_IdAndAlertTypeAndMeterReadingId(Long householdUserId, String alertType, Long meterReadingId);
}