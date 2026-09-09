package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.TariffPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apartment-admin/tariff-plan")
@RequiredArgsConstructor
public class TariffPlanController {

    private final TariffPlanService tariffPlanService;

    @GetMapping
    public ResponseEntity<ApiResponse<TariffPlanResponse>> get(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Tariff plan fetched.", tariffPlanService.getTariffPlan(principal.getId())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<TariffPlanResponse>> update(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody TariffPlanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tariff plan updated.", tariffPlanService.updateTariffPlan(principal.getId(), request)));
    }
}