package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.ApiResponse;
import com.waterbilling1.water_billing_system.dto.DistributionResult;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.BillingDistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/distribution")
@RequiredArgsConstructor
public class BillingDistributionController {

    private final BillingDistributionService billingDistributionService;

    @GetMapping("/{billingCycle}")
    public ResponseEntity<ApiResponse<List<DistributionResult>>> distribute(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String billingCycle) {
        return ResponseEntity.ok(ApiResponse.success("Cost distribution calculated.",
                billingDistributionService.distributeCycleCost(principal.getId(), billingCycle)));
    }
}