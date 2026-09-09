package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicket_IdOrderByCreatedAtAsc(Long ticketId);
}