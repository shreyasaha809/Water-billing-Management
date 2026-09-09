package com.waterbilling1.water_billing_system.repository;

import com.waterbilling1.water_billing_system.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicket_Id(Long ticketId);
}