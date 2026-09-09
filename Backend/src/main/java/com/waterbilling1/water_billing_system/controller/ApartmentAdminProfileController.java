package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.ApartmentAdminProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apartment-admin/profile")
@RequiredArgsConstructor
public class ApartmentAdminProfileController {

    private final ApartmentAdminProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<ApartmentAdminProfileResponse>> getProfile(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully.",
                profileService.getProfile(principal.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ApartmentAdminProfileResponse>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody UpdateApartmentAdminProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.",
                profileService.updateProfile(principal.getId(), request)));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        profileService.changePassword(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully."));
    }
}