package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.ApartmentAdminChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin")
@RequiredArgsConstructor
public class ApartmentAdminChartController {

    private final ApartmentAdminChartService apartmentAdminChartService;

    @GetMapping("/charts/household-usage")
    public ResponseEntity<ApiResponse<List<HouseholdUsageBarPoint>>> getHouseholdUsage(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Household usage comparison fetched.",
                apartmentAdminChartService.getHouseholdUsageComparison(principal.getId())));
    }
}