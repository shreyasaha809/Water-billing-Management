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
@RequestMapping("/api/super-admin/support")
@RequiredArgsConstructor
public class SuperAdminSupportController {

    private final SupportTicketService supportTicketService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketSummaryResponse>>> getEscalatedTickets(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) Long apartmentId) {
        return ResponseEntity.ok(ApiResponse.success("Escalated tickets fetched.",
                supportTicketService.getEscalatedTicketsForSuperAdmin(principal.getId(), apartmentId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetail(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket detail fetched.",
                supportTicketService.getTicketDetailForSuperAdmin(principal.getId(), id)));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> addMessage(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody AddTicketMessageRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Message added.",
                supportTicketService.addSuperAdminMessage(principal.getId(), id, request)));
    }

    @PutMapping("/{id}/resolve-and-forward")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> resolveAndForward(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Resolution forwarded to Apartment Admin.",
                supportTicketService.resolveAndForwardToAdmin(principal.getId(), id)));
    }

    // Full status control for tickets an Apartment Admin raised directly to the Super Admin.
    // Does NOT apply to household tickets escalated by an Apartment Admin — those still use
    // resolve-and-forward above.
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated.",
                supportTicketService.updateTicketStatusBySuperAdmin(principal.getId(), id, request)));
    }
}