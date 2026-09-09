package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.WaterUsageBillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/household-user/water-usage")
@RequiredArgsConstructor
public class HouseholdWaterUsageController {

    private final WaterUsageBillingService waterUsageBillingService;

    @GetMapping("/latest-reading")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> getLatestReading(
            @AuthenticationPrincipal CustomUserDetails principal) {
        MeterReadingResponse reading = waterUsageBillingService.getLatestReadingForHousehold(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Latest reading fetched.", reading));
    }

    @GetMapping("/latest-bill")
    public ResponseEntity<ApiResponse<BillResponse>> getLatestBill(
            @AuthenticationPrincipal CustomUserDetails principal) {
        BillResponse bill = waterUsageBillingService.getLatestBillForHousehold(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Latest bill fetched.", bill));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getBillHistory(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Bill history fetched.",
                waterUsageBillingService.getBillHistoryForHousehold(principal.getId())));
    }
}