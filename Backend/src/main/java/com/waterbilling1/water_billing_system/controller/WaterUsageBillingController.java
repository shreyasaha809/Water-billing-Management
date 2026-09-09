package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.WaterUsageBillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/water-usage")
@RequiredArgsConstructor
public class WaterUsageBillingController {

    private final WaterUsageBillingService waterUsageBillingService;

    @PostMapping("/readings")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> recordReading(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody RecordMeterReadingRequest request) {

        MeterReadingResponse response = waterUsageBillingService.recordMeterReading(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Meter reading recorded successfully.", response));
    }

    @GetMapping("/readings")
    public ResponseEntity<ApiResponse<List<MeterReadingResponse>>> getReadings(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Meter readings fetched successfully.",
                waterUsageBillingService.getMeterReadingsForAdmin(principal.getId())));
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<BillResponse>>> getBills(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Bills fetched successfully.",
                waterUsageBillingService.getBillsForAdmin(principal.getId())));
    }

    @DeleteMapping("/bills/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBill(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long id) {
        waterUsageBillingService.deleteBill(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Bill deleted successfully."));
    }

    @PostMapping("/generate-bill")
    public ResponseEntity<ApiResponse<BillResponse>> generateMonthlyBill(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody GenerateBillRequest request) {
        BillResponse response = waterUsageBillingService.generateMonthlyBill(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Monthly bill generated successfully.", response));
    }
}