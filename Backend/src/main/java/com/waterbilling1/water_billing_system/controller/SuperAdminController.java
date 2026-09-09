package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.SuperAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {

    private final SuperAdminService superAdminService;

    @GetMapping("/apartment-admins/pending")
    public ResponseEntity<ApiResponse<List<ApartmentAdminSummaryResponse>>> getPendingRequests() {
        return ResponseEntity.ok(ApiResponse.success("Pending requests fetched successfully.",
                superAdminService.getPendingApartmentAdmins()));
    }

    @GetMapping("/apartment-admins")
    public ResponseEntity<ApiResponse<List<ApartmentAdminSummaryResponse>>> getAllApartmentAdmins() {
        return ResponseEntity.ok(ApiResponse.success("Apartment Admins fetched successfully.",
                superAdminService.getAllApartmentAdmins()));
    }

    @PutMapping("/apartment-admins/{id}/approve")
    public ResponseEntity<ApiResponse<ApprovalActionResponse>> approve(@PathVariable Long id) {
        ApprovalActionResponse response = superAdminService.approveApartmentAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PutMapping("/apartment-admins/{id}/reject")
    public ResponseEntity<ApiResponse<ApprovalActionResponse>> reject(@PathVariable Long id) {
        ApprovalActionResponse response = superAdminService.rejectApartmentAdmin(id);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @DeleteMapping("/apartment-admins/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteApartment(@PathVariable Long id) {
        superAdminService.deleteApartmentAdmin(id);
        return ResponseEntity.ok(ApiResponse.success("Apartment and admin deleted successfully."));
    }

    @GetMapping("/apartment-admins/deleted-logs")
    public ResponseEntity<ApiResponse<List<DeletedApartmentLogResponse>>> getDeletedLogs() {
        return ResponseEntity.ok(ApiResponse.success("Deleted apartment logs fetched successfully.",
                superAdminService.getDeletedApartmentLogs()));
    }

    @GetMapping("/households")
    public ResponseEntity<ApiResponse<List<HouseholdUserSummaryResponse>>> getAllHouseholds() {
        return ResponseEntity.ok(ApiResponse.success("Households fetched successfully.",
                superAdminService.getAllHouseholdUsers()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SuperAdminProfileResponse>> getProfile(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully.",
                superAdminService.getProfile(principal.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<SuperAdminProfileResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateProfileRequest request) {
        SuperAdminProfileResponse updated = superAdminService.updateProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", updated));
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        superAdminService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }
    @GetMapping("/households/readings-count")
    public ResponseEntity<ApiResponse<Long>> getHouseholdsWithReadingsCount() {
        return ResponseEntity.ok(ApiResponse.success("Count fetched successfully.",
                superAdminService.getHouseholdsWithReadingsCount()));
    }

    @GetMapping("/apartments/{apartmentId}/households")
    public ResponseEntity<ApiResponse<List<HouseholdUserSummaryResponse>>> getHouseholdsByApartment(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(ApiResponse.success("Households fetched successfully.",
                superAdminService.getHouseholdsByApartment(apartmentId)));
    }
}

