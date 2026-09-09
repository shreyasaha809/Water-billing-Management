package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.HouseholdUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/households")
@RequiredArgsConstructor
public class HouseholdUserController {

    private final HouseholdUserService householdUserService;

    @PostMapping
    public ResponseEntity<ApiResponse<HouseholdUserSummaryResponse>> register(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody RegisterHouseholdUserRequest request) {

        HouseholdUserSummaryResponse response =
                householdUserService.registerHouseholdUser(principal.getId(), request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Household user registered successfully.", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HouseholdUserSummaryResponse>>> list(
            @AuthenticationPrincipal CustomUserDetails principal) {

        List<HouseholdUserSummaryResponse> list =
                householdUserService.getHouseholdUsersForAdmin(principal.getId());

        return ResponseEntity.ok(ApiResponse.success("Household users fetched successfully.", list));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HouseholdUserSummaryResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateHouseholdUserRequest request) {

        HouseholdUserSummaryResponse response =
                householdUserService.updateHouseholdUser(principal.getId(), id, request);

        return ResponseEntity.ok(ApiResponse.success("Household user updated successfully.", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {

        householdUserService.deleteHouseholdUser(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Household user deleted successfully."));
    }

    @GetMapping("/deleted-logs")
    public ResponseEntity<ApiResponse<List<DeletedHouseholdLogResponse>>> deletedLogs(
            @AuthenticationPrincipal CustomUserDetails principal) {

        return ResponseEntity.ok(ApiResponse.success("Deleted household logs fetched successfully.",
                householdUserService.getDeletedHouseholdLogs(principal.getId())));
    }
}