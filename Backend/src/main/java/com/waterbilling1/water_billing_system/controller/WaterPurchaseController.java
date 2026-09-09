package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.WaterPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/water-purchases")
@RequiredArgsConstructor
public class WaterPurchaseController {

    private final WaterPurchaseService waterPurchaseService;

    @PostMapping
    public ResponseEntity<ApiResponse<WaterPurchaseResponse>> record(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody RecordWaterPurchaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Water purchase recorded.", waterPurchaseService.recordPurchase(principal.getId(), request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WaterPurchaseResponse>>> list(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Purchases fetched.", waterPurchaseService.getPurchasesForAdmin(principal.getId())));
    }
}