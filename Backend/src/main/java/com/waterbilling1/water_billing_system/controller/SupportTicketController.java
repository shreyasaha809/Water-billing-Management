package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.SupportTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/household-user/support")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<TicketSummaryResponse>> createTicket(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestPart("category") String category,
            @RequestPart("title") String title,
            @RequestPart("description") String description,
            @RequestPart(value = "priority", required = false) String priority,
            @RequestPart(value = "attachments", required = false) List<MultipartFile> attachments) {

        CreateTicketRequest request = CreateTicketRequest.builder()
                .category(category).title(title).description(description).priority(priority).build();

        TicketSummaryResponse response = supportTicketService.createTicket(principal.getId(), request, attachments);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Support ticket created successfully.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketSummaryResponse>>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Tickets fetched successfully.",
                supportTicketService.getTicketsForHousehold(principal.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailResponse>> getTicketDetail(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Ticket detail fetched.",
                supportTicketService.getTicketDetailForHousehold(principal.getId(), id)));
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<ApiResponse<TicketMessageResponse>> addMessage(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody AddTicketMessageRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Message added.",
                        supportTicketService.addHouseholdMessage(principal.getId(), id, request)));
    }
}