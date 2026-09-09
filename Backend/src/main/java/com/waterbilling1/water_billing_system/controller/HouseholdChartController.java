package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.HouseholdChartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/household-user")
@RequiredArgsConstructor
public class HouseholdChartController {

    private final HouseholdChartService householdChartService;

    @GetMapping("/charts/daily-usage")
    public ResponseEntity<ApiResponse<List<DailyUsagePoint>>> getDailyUsage(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Daily usage fetched.",
                householdChartService.getDailyUsage(principal.getId())));
    }

    @GetMapping("/charts/monthly-usage")
    public ResponseEntity<ApiResponse<List<MonthlyUsagePoint>>> getMonthlyUsage(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Monthly usage fetched.",
                householdChartService.getMonthlyUsage(principal.getId())));
    }

    @GetMapping("/usage-comparison")
    public ResponseEntity<ApiResponse<UsageComparisonResponse>> getUsageComparison(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Usage comparison fetched.",
                householdChartService.getUsageComparison(principal.getId())));
    }
}