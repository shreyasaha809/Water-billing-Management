package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByHouseholdUser_IdOrderByCreatedAtDesc(Long householdUserId);
    List<SupportTicket> findByApartment_IdOrderByCreatedAtDesc(Long apartmentId);
    List<SupportTicket> findByStatusOrderByCreatedAtDesc(String status);
    Optional<SupportTicket> findByIdAndHouseholdUser_Id(Long id, Long householdUserId);
    Optional<SupportTicket> findByIdAndApartment_Id(Long id, Long apartmentId);
    long countByApartment_Id(Long apartmentId);
    boolean existsByTicketNumber(String ticketNumber);
    List<SupportTicket> findByEscalatedAtIsNotNullOrderByCreatedAtDesc();
}
