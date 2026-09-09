package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SupportTicketService {
    TicketSummaryResponse createTicket(Long householdUserId, CreateTicketRequest request, List<MultipartFile> attachments);
    List<TicketSummaryResponse> getTicketsForHousehold(Long householdUserId);
    TicketDetailResponse getTicketDetailForHousehold(Long householdUserId, Long ticketId);
    TicketMessageResponse addHouseholdMessage(Long householdUserId, Long ticketId, AddTicketMessageRequest request);

    List<TicketSummaryResponse> getTicketsForAdmin(Long apartmentAdminUserId, String statusFilter);
    TicketDetailResponse getTicketDetailForAdmin(Long apartmentAdminUserId, Long ticketId);
    TicketSummaryResponse acceptTicket(Long apartmentAdminUserId, Long ticketId);
    TicketMessageResponse addAdminMessage(Long apartmentAdminUserId, Long ticketId, AddTicketMessageRequest request);
    TicketSummaryResponse updateTicketStatus(Long apartmentAdminUserId, Long ticketId, UpdateTicketStatusRequest request);
    TicketSummaryResponse escalateTicket(Long apartmentAdminUserId, Long ticketId);
    TicketSummaryResponse createTicketByAdmin(Long apartmentAdminUserId, CreateAdminTicketRequest request, List<MultipartFile> attachments);

    List<TicketSummaryResponse> getEscalatedTicketsForSuperAdmin(Long superAdminUserId, Long apartmentIdFilter);
    TicketDetailResponse getTicketDetailForSuperAdmin(Long superAdminUserId, Long ticketId);
    TicketMessageResponse addSuperAdminMessage(Long superAdminUserId, Long ticketId, AddTicketMessageRequest request);
    TicketSummaryResponse resolveAndForwardToAdmin(Long superAdminUserId, Long ticketId);
    // Only for Apartment Admin -> Super Admin tickets (ticket.raisedByAdmin != null).
    // Household tickets escalated to Super Admin keep using resolveAndForwardToAdmin above — unchanged.
    TicketSummaryResponse updateTicketStatusBySuperAdmin(Long superAdminUserId, Long ticketId, UpdateTicketStatusRequest request);
}