package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.BillingCycleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/billing-cycles")
@RequiredArgsConstructor
public class BillingCycleController {

    private final BillingCycleService billingCycleService;

    @PostMapping("/{cycleName}/open")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> open(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable String cycleName) {
        return ResponseEntity.ok(ApiResponse.success("Cycle opened.", billingCycleService.openCycle(principal.getId(), cycleName)));
    }

    @PutMapping("/{cycleName}/finalize")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> finalize(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable String cycleName) {
        return ResponseEntity.ok(ApiResponse.success("Cycle finalized and bills generated.", billingCycleService.finalizeCycle(principal.getId(), cycleName)));
    }

    @PutMapping("/{cycleName}/archive")
    public ResponseEntity<ApiResponse<BillingCycleResponse>> archive(
            @AuthenticationPrincipal CustomUserDetails principal, @PathVariable String cycleName) {
        return ResponseEntity.ok(ApiResponse.success("Cycle archived.", billingCycleService.archiveCycle(principal.getId(), cycleName)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BillingCycleResponse>>> list(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Cycles fetched.", billingCycleService.getCyclesForAdmin(principal.getId())));
    }
}