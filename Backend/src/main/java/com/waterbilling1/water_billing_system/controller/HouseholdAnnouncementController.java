package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/household-user/announcements")
@RequiredArgsConstructor
public class HouseholdAnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Announcements fetched successfully.",
                announcementService.getAnnouncementsForHousehold(principal.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getDetail(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Announcement detail fetched.",
                announcementService.getAnnouncementDetailForHousehold(principal.getId(), id)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        announcementService.markAsRead(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read."));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<AnnouncementUnreadCountResponse>> getUnreadCount(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Unread count fetched.",
                announcementService.getUnreadCount(principal.getId())));
    }
}