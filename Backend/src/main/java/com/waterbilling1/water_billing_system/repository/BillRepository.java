package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByApartment_IdOrderByGeneratedDateDesc(Long apartmentId);
    List<Bill> findByHouseholdUser_IdOrderByGeneratedDateDesc(Long householdUserId);
    Optional<Bill> findTopByHouseholdUser_IdOrderByGeneratedDateDesc(Long householdUserId);
    Optional<Bill> findByIdAndApartment_Id(Long id, Long apartmentId);
    boolean existsByHouseholdUser_IdAndBillingCycle(Long householdUserId, String billingCycle);
    Optional<Bill> findByHouseholdUser_IdAndBillingCycle(Long householdUserId, String billingCycle);
}