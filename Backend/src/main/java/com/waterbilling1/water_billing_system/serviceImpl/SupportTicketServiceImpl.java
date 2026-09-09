package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.entity.*;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.FileStorageService;
import com.waterbilling1.water_billing_system.service.NotificationService;
import com.waterbilling1.water_billing_system.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.waterbilling1.water_billing_system.repository.SuperAdminRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository ticketRepository;
    private final TicketMessageRepository messageRepository;
    private final TicketAttachmentRepository attachmentRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;
    private final SuperAdminRepository superAdminRepository;

    @Override
    @Transactional
    public TicketSummaryResponse createTicket(Long householdUserId, CreateTicketRequest request, List<MultipartFile> attachments) {

        if (householdUserId == null) {
            throw new ResourceNotFoundException("No logged-in household user found. Please log in again.");
        }

        HouseholdUser household = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found for id: " + householdUserId));

        System.out.println("=== householdUserId param: " + householdUserId + " | household.getId(): " + household.getId() + " | email: " + household.getEmail());
        if (household.getApartment() == null) {
            throw new ResourceNotFoundException("This household user is not linked to any apartment.");
        }

        SupportTicket ticket = new SupportTicket();
        ticket.setApartment(household.getApartment());
        ticket.setHouseholdUser(household);
        ticket.setCategory(request.getCategory());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setTicketNumber("PENDING-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setStatus("PENDING");
        ticket.setPriority(request.getPriority() != null && !request.getPriority().isBlank() ? request.getPriority() : "MEDIUM");

        SupportTicket saved = ticketRepository.saveAndFlush(ticket);

        saved.setTicketNumber(generateUniqueTicketNumber(saved.getId()));
        saved = ticketRepository.saveAndFlush(saved);

        final SupportTicket finalSaved = saved;   // ADD THIS LINE

        if (attachments != null) {
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file);
                    TicketAttachment attachment = TicketAttachment.builder()
                            .ticket(finalSaved)   // CHANGED
                            .fileName(file.getOriginalFilename())
                            .fileUrl(url)
                            .build();
                    attachmentRepository.save(attachment);
                }
            }
        }

        notificationService.notify(household, "Support Ticket Created",
                String.format("Your ticket %s has been created and is pending review.", finalSaved.getTicketNumber()),  // CHANGED
                "INFO");

        apartmentAdminRepository.findByApartment_Id(household.getApartment().getId())
                .ifPresent(admin -> notificationService.notifyByRole(admin.getId(), "APARTMENT_ADMIN",
                        "New Support Ticket",
                        String.format("%s (Flat %s) raised a new ticket: %s", household.getFullName(), household.getFlatNumber(), finalSaved.getTitle()),  // CHANGED
                        "INFO"));

        return toSummary(finalSaved);   // CHANGED
    }

    @Override
    @Transactional
    public TicketSummaryResponse createTicketByAdmin(Long apartmentAdminUserId, CreateAdminTicketRequest request, List<MultipartFile> attachments) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = new SupportTicket();
        ticket.setApartment(admin.getApartment());
        ticket.setHouseholdUser(null);
        ticket.setRaisedByAdmin(admin);
        ticket.setAssignedAdmin(admin);
        ticket.setCategory(request.getCategory() == null || request.getCategory().isBlank() ? "OTHER" : request.getCategory());
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setTicketNumber("PENDING-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        // Sent straight to the Super Admin queue, reusing the existing escalation status
        // so it appears in the Super Admin's ticket list without any change to that flow.
        ticket.setStatus("ESCALATED");
        ticket.setEscalatedAt(java.time.LocalDateTime.now());

        SupportTicket saved = ticketRepository.saveAndFlush(ticket);
        saved.setTicketNumber(generateUniqueTicketNumber(saved.getId()));
        saved = ticketRepository.saveAndFlush(saved);

        final SupportTicket finalSaved = saved;

        if (attachments != null) {
            for (MultipartFile file : attachments) {
                if (file != null && !file.isEmpty()) {
                    String url = fileStorageService.storeFile(file);
                    TicketAttachment attachment = TicketAttachment.builder()
                            .ticket(finalSaved)
                            .fileName(file.getOriginalFilename())
                            .fileUrl(url)
                            .build();
                    attachmentRepository.save(attachment);
                }
            }
        }

        superAdminRepository.findAll().forEach(sa ->
                notificationService.notifyByRole(sa.getId(), "SUPER_ADMIN",
                        "New Ticket from Apartment Admin",
                        String.format("%s (%s) raised a new ticket: %s", admin.getFullName(),
                                admin.getApartment().getApartmentName(), finalSaved.getTitle()),
                        "WARNING"));

        return toSummary(finalSaved);
    }

    @Override
    public List<TicketSummaryResponse> getTicketsForHousehold(Long householdUserId) {
        return ticketRepository.findByHouseholdUser_IdOrderByCreatedAtDesc(householdUserId)
                .stream().map(this::toSummary).toList();
    }

    @Override
    public TicketDetailResponse getTicketDetailForHousehold(Long householdUserId, Long ticketId) {
        SupportTicket ticket = ticketRepository.findByIdAndHouseholdUser_Id(ticketId, householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));
        return toDetail(ticket, false);
    }

    @Override
    public List<TicketSummaryResponse> getTicketsForAdmin(Long apartmentAdminUserId, String statusFilter) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<SupportTicket> tickets = ticketRepository.findByApartment_IdOrderByCreatedAtDesc(admin.getApartment().getId());

        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            tickets = tickets.stream().filter(t -> statusFilter.equalsIgnoreCase(t.getStatus())).toList();
        }

        return tickets.stream().map(this::toSummary).toList();
    }

    @Override
    public TicketDetailResponse getTicketDetailForAdmin(Long apartmentAdminUserId, Long ticketId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = ticketRepository.findByIdAndApartment_Id(ticketId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        return toDetail(ticket, true);
    }

    @Override
    @Transactional
    public TicketSummaryResponse acceptTicket(Long apartmentAdminUserId, Long ticketId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = ticketRepository.findByIdAndApartment_Id(ticketId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        if (!"PENDING".equals(ticket.getStatus())) {
            throw new IllegalStateException("Only a PENDING ticket can be accepted. Current status: " + ticket.getStatus());
        }

        ticket.setAssignedAdmin(admin);
        ticket.setStatus("ACCEPTED");
        SupportTicket saved = ticketRepository.save(ticket);

        if (ticket.getHouseholdUser() != null) {
            notificationService.notify(ticket.getHouseholdUser(), "Ticket Accepted",
                    String.format("Your ticket %s has been accepted and is being reviewed.", ticket.getTicketNumber()),
                    "INFO");
        }

        return toSummary(saved);
    }

    @Override
    @Transactional
    public TicketMessageResponse addAdminMessage(Long apartmentAdminUserId, Long ticketId, AddTicketMessageRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = ticketRepository.findByIdAndApartment_Id(ticketId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        boolean isInternal = Boolean.TRUE.equals(request.getIsInternalNote());

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .senderRole("APARTMENT_ADMIN")
                .senderId(apartmentAdminUserId)
                .senderName(admin.getFullName())
                .message(request.getMessage())
                .isInternalNote(isInternal)
                .build();

        TicketMessage saved = messageRepository.save(message);

        if (!isInternal && ticket.getHouseholdUser() != null) {
            notificationService.notify(ticket.getHouseholdUser(), "New Reply on Your Ticket",
                    String.format("%s replied on your ticket %s.", admin.getFullName(), ticket.getTicketNumber()),
                    "INFO");
        }

        return toMessageResponse(saved);
    }

    @Override
    @Transactional
    public TicketSummaryResponse updateTicketStatus(Long apartmentAdminUserId, Long ticketId, UpdateTicketStatusRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = ticketRepository.findByIdAndApartment_Id(ticketId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        // This ticket was created by an Apartment Admin and sent to the Super Admin —
        // only the Super Admin may change its status; the Apartment Admin can only view it.
        if (ticket.getRaisedByAdmin() != null) {
            throw new IllegalStateException("This ticket was sent to the Super Admin. Only the Super Admin can update its status.");
        }

        List<String> allowed = List.of("IN_PROGRESS", "RESOLVED", "CLOSED", "WAITING_FOR_USER");
        if (!allowed.contains(request.getStatus())) {
            throw new IllegalArgumentException("Invalid status. Must be one of: " + allowed);
        }

        ticket.setStatus(request.getStatus());
        if ("RESOLVED".equals(request.getStatus())) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }
        SupportTicket saved = ticketRepository.save(ticket);

        if (ticket.getHouseholdUser() != null) {
            notificationService.notify(ticket.getHouseholdUser(), "Ticket Status Updated",
                    String.format("Your ticket %s status changed to %s.", ticket.getTicketNumber(), request.getStatus().replace("_", " ")),
                    "INFO");
        }

        return toSummary(saved);
    }

    @Override
    @Transactional
    public TicketSummaryResponse escalateTicket(Long apartmentAdminUserId, Long ticketId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        SupportTicket ticket = ticketRepository.findByIdAndApartment_Id(ticketId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        ticket.setStatus("ESCALATED");
        ticket.setEscalatedAt(java.time.LocalDateTime.now());
        SupportTicket saved = ticketRepository.save(ticket);

        if (ticket.getHouseholdUser() != null) {
            notificationService.notify(ticket.getHouseholdUser(), "Ticket Escalated",
                    String.format("Your ticket %s has been escalated to Super Admin for further review.", ticket.getTicketNumber()),
                    "WARNING");
        }

        superAdminRepository.findAll().forEach(sa ->
                notificationService.notifyByRole(sa.getId(), "SUPER_ADMIN",
                        "Ticket Escalated",
                        String.format("Ticket %s from %s was escalated and needs review.", ticket.getTicketNumber(), admin.getApartment().getApartmentName()),
                        "WARNING"));

        return toSummary(saved);
    }

    @Override
    public List<TicketSummaryResponse> getEscalatedTicketsForSuperAdmin(Long superAdminUserId, Long apartmentIdFilter) {
        SuperAdmin superAdmin = superAdminRepository.findById(superAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        List<SupportTicket> tickets = ticketRepository.findByEscalatedAtIsNotNullOrderByCreatedAtDesc();

        if (apartmentIdFilter != null) {
            tickets = tickets.stream().filter(t -> t.getApartment().getId().equals(apartmentIdFilter)).toList();
        }

        return tickets.stream().map(this::toSummary).toList();
    }

    @Override
    public TicketDetailResponse getTicketDetailForSuperAdmin(Long superAdminUserId, Long ticketId) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        return toDetail(ticket, true);
    }

    @Override
    @Transactional
    public TicketMessageResponse addSuperAdminMessage(Long superAdminUserId, Long ticketId, AddTicketMessageRequest request) {
        SuperAdmin superAdmin = superAdminRepository.findById(superAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        if (ticket.getAssignedSuperAdmin() == null) {
            ticket.setAssignedSuperAdmin(superAdmin);
            ticketRepository.save(ticket);
        }

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .senderRole("SUPER_ADMIN")
                .senderId(superAdminUserId)
                .senderName(superAdmin.getFullName())
                .message(request.getMessage())
                .isInternalNote(false)
                .build();

        TicketMessage saved = messageRepository.save(message);

        if (ticket.getAssignedAdmin() != null) {
            notificationService.notifyByRole(ticket.getAssignedAdmin().getId(), "APARTMENT_ADMIN",
                    "Super Admin Replied",
                    String.format("Super Admin replied on escalated ticket %s.", ticket.getTicketNumber()),
                    "INFO");
        }

        return toMessageResponse(saved);
    }

    @Override
    @Transactional
    public TicketSummaryResponse resolveAndForwardToAdmin(Long superAdminUserId, Long ticketId) {
        SuperAdmin superAdmin = superAdminRepository.findById(superAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        ticket.setStatus("WAITING_FOR_USER");
        SupportTicket saved = ticketRepository.save(ticket);

        if (ticket.getAssignedAdmin() != null) {
            notificationService.notifyByRole(ticket.getAssignedAdmin().getId(), "APARTMENT_ADMIN",
                    "Resolution Received from Super Admin",
                    String.format("Super Admin has provided a solution for ticket %s. Please forward the final resolution to the household.", ticket.getTicketNumber()),
                    "SUCCESS");
        }

        if (ticket.getHouseholdUser() != null) {
            notificationService.notify(ticket.getHouseholdUser(), "Ticket Update",
                    String.format("Your escalated ticket %s has been reviewed. Your Apartment Admin will follow up shortly.", ticket.getTicketNumber()),
                    "INFO");
        }

        return toSummary(saved);
    }

    // Full status control (In Progress / Resolved / Closed) for the Super Admin — but only
    // on tickets an Apartment Admin raised directly to the Super Admin. Household tickets that
    // were escalated by an Apartment Admin keep using resolveAndForwardToAdmin() above, unchanged.
    @Override
    @Transactional
    public TicketSummaryResponse updateTicketStatusBySuperAdmin(Long superAdminUserId, Long ticketId, UpdateTicketStatusRequest request) {
        SuperAdmin superAdmin = superAdminRepository.findById(superAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Super Admin not found."));

        SupportTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        if (ticket.getRaisedByAdmin() == null) {
            throw new IllegalStateException("Only tickets raised by an Apartment Admin can be resolved this way. Use Resolve & Forward for household tickets.");
        }

        List<String> allowed = List.of("IN_PROGRESS", "RESOLVED", "CLOSED");
        if (!allowed.contains(request.getStatus())) {
            throw new IllegalArgumentException("Invalid status. Must be one of: " + allowed);
        }

        if (ticket.getAssignedSuperAdmin() == null) {
            ticket.setAssignedSuperAdmin(superAdmin);
        }

        ticket.setStatus(request.getStatus());
        if ("RESOLVED".equals(request.getStatus())) {
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        }
        SupportTicket saved = ticketRepository.save(ticket);

        if (ticket.getRaisedByAdmin() != null) {
            notificationService.notifyByRole(ticket.getRaisedByAdmin().getId(), "APARTMENT_ADMIN",
                    "Ticket Status Updated",
                    String.format("Your ticket %s to the Super Admin is now %s.", ticket.getTicketNumber(), request.getStatus().replace("_", " ")),
                    "INFO");
        }

        return toSummary(saved);
    }

    @Override
    @Transactional
    public TicketMessageResponse addHouseholdMessage(Long householdUserId, Long ticketId, AddTicketMessageRequest request) {
        SupportTicket ticket = ticketRepository.findByIdAndHouseholdUser_Id(ticketId, householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found."));

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .senderRole("HOUSEHOLD")
                .senderId(householdUserId)
                .senderName(ticket.getHouseholdUser().getFullName())
                .message(request.getMessage())
                .isInternalNote(false)
                .build();

        TicketMessage saved = messageRepository.save(message);

        if (ticket.getAssignedAdmin() != null) {
            notificationService.notifyByRole(ticket.getAssignedAdmin().getId(), "APARTMENT_ADMIN",
                    "New Reply on Ticket",
                    String.format("%s replied on ticket %s.", ticket.getHouseholdUser().getFullName(), ticket.getTicketNumber()),
                    "INFO");
        }

        return toMessageResponse(saved);
    }

    // Builds a ticket number from the row's id, but falls back to a random
    // suffix if that number is somehow already taken (e.g. the auto-increment
    // counter is behind existing data) so ticket creation never fails with a
    // unique-constraint conflict.
    private String generateUniqueTicketNumber(Long id) {
        String candidate = String.format("TICKET-%06d", id);
        while (ticketRepository.existsByTicketNumber(candidate)) {
            candidate = "TICKET-" + id + "-" + java.util.UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        }
        return candidate;
    }

    private TicketSummaryResponse toSummary(SupportTicket t) {
        return TicketSummaryResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .category(t.getCategory())
                .priority(t.getPriority())
                .title(t.getTitle())
                .status(t.getStatus())
                .householdName(t.getHouseholdUser() != null ? t.getHouseholdUser().getFullName() : null)
                .flatNumber(t.getHouseholdUser() != null ? t.getHouseholdUser().getFlatNumber() : null)
                .raisedByAdminName(t.getRaisedByAdmin() != null ? t.getRaisedByAdmin().getFullName() : null)
                .createdAt(t.getCreatedAt())
                .resolvedAt(t.getResolvedAt())
                .build();
    }

    private TicketDetailResponse toDetail(SupportTicket t, boolean includeInternalNotes) {
        List<TicketMessageResponse> messages = messageRepository.findByTicket_IdOrderByCreatedAtAsc(t.getId())
                .stream()
                .filter(m -> includeInternalNotes || !m.getIsInternalNote())
                .map(this::toMessageResponse)
                .toList();

        List<TicketAttachmentResponse> ticketAttachments = attachmentRepository.findByTicket_Id(t.getId())
                .stream()
                .filter(a -> a.getMessage() == null)
                .map(a -> TicketAttachmentResponse.builder().id(a.getId()).fileName(a.getFileName()).fileUrl(a.getFileUrl()).build())
                .toList();

        return TicketDetailResponse.builder()
                .id(t.getId())
                .ticketNumber(t.getTicketNumber())
                .category(t.getCategory())
                .priority(t.getPriority())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .householdName(t.getHouseholdUser() != null ? t.getHouseholdUser().getFullName() : null)
                .flatNumber(t.getHouseholdUser() != null ? t.getHouseholdUser().getFlatNumber() : null)
                .raisedByAdminName(t.getRaisedByAdmin() != null ? t.getRaisedByAdmin().getFullName() : null)
                .assignedAdminName(t.getAssignedAdmin() != null ? t.getAssignedAdmin().getFullName() : null)
                .assignedSuperAdminName(t.getAssignedSuperAdmin() != null ? t.getAssignedSuperAdmin().getFullName() : null)
                .createdAt(t.getCreatedAt())
                .resolvedAt(t.getResolvedAt())
                .messages(messages)
                .ticketAttachments(ticketAttachments)
                .build();
    }

    private TicketMessageResponse toMessageResponse(TicketMessage m) {
        List<TicketAttachmentResponse> attachments = attachmentRepository.findByTicket_Id(m.getTicket().getId())
                .stream()
                .filter(a -> a.getMessage() != null && a.getMessage().getId().equals(m.getId()))
                .map(a -> TicketAttachmentResponse.builder().id(a.getId()).fileName(a.getFileName()).fileUrl(a.getFileUrl()).build())
                .toList();

        return TicketMessageResponse.builder()
                .id(m.getId())
                .senderRole(m.getSenderRole())
                .senderName(m.getSenderName())
                .message(m.getMessage())
                .isInternalNote(m.getIsInternalNote())
                .createdAt(m.getCreatedAt())
                .attachments(attachments)
                .build();
    }
}