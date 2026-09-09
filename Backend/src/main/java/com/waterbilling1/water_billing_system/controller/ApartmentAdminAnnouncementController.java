package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/announcements")
@RequiredArgsConstructor
public class ApartmentAdminAnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CreateAnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement published successfully.",
                        announcementService.createAnnouncement(principal.getId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id,
            @Valid @RequestBody UpdateAnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement updated successfully.",
                announcementService.updateAnnouncement(principal.getId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable Long id) {
        announcementService.deleteAnnouncement(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted successfully."));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAll(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Announcements fetched successfully.",
                announcementService.getAnnouncementsForAdmin(principal.getId())));
    }

    @PostMapping("/archive-expired")
    public ResponseEntity<ApiResponse<String>> archiveExpired(
            @AuthenticationPrincipal CustomUserDetails principal) {
        int count = announcementService.archiveExpiredAnnouncements(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(count + " expired announcement(s) archived.", null));
    }
}