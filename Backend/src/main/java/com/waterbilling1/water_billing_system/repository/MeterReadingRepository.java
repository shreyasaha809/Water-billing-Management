package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    Optional<MeterReading> findTopByHouseholdUser_IdOrderByReadingDateDesc(Long householdUserId);

    List<MeterReading> findByApartment_IdOrderByReadingDateDesc(Long apartmentId);

    List<MeterReading> findByHouseholdUser_IdOrderByReadingDateDesc(Long householdUserId);

    List<MeterReading> findByHouseholdUser_IdAndBillingCycleOrderByReadingDateAsc(Long householdUserId, String billingCycle);

    @Query("SELECT COUNT(DISTINCT m.householdUser.id) FROM MeterReading m")
    long countDistinctHouseholdUsersWithReadings();

    @Query("SELECT COUNT(DISTINCT m.householdUser.id) FROM MeterReading m WHERE m.apartment.id = :apartmentId")
    long countDistinctHouseholdUsersWithReadingsByApartment(Long apartmentId);
}