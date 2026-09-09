package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.ApiResponse;
import com.waterbilling1.water_billing_system.dto.WaterTipsResponse;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.WaterTipsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/household-user/water-tips")
@RequiredArgsConstructor
public class HouseholdWaterTipsController {

    private final WaterTipsService waterTipsService;

    @GetMapping
    public ResponseEntity<ApiResponse<WaterTipsResponse>> getTips(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Water tips fetched.",
                waterTipsService.getTipsForHousehold(principal.getId())));
    }
}