package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBill_Id(Long billId);
    List<Payment> findByHouseholdUser_IdOrderByPaymentDateDesc(Long householdUserId);
}