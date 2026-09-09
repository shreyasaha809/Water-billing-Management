package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/support")
@RequiredArgsConstructor
public class ApartmentAdminSupportController {

    private final SupportTicketService supportTicketService;

    @PostMapping(value = "/tickets", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> createTicket(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart(value = "category", required = false) String category,
            @RequestPart("priority") String priority,
            @RequestPart(value = "attachments", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> attachments) {

        CreateAdminTicketRequest request = CreateAdminTicketRequest.builder()
                .title(title).description(description).category(category).priority(priority).build();

        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket sent to Super Admin.",
                        supportTicketService.createTicketByAdmin(principal.getId(), request, attachments)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketSummaryResponse>>> getTickets(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched successfully.",
                supportTicketService.getTicketsForAdmin(principal.getId(), status)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetail(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket detail fetched.",
                supportTicketService.getTicketDetailForAdmin(principal.getId(), id)));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> acceptTicket(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket accepted.",
                supportTicketService.acceptTicket(principal.getId(), id)));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> addMessage(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody AddTicketMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Message added.",
                supportTicketService.addAdminMessage(principal.getId(), id, request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated.",
                supportTicketService.updateTicketStatus(principal.getId(), id, request)));
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> escalate(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket escalated to Super Admin.",
                supportTicketService.escalateTicket(principal.getId(), id)));
    }
}