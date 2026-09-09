package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.AlertResponse;
import com.waterbilling1.water_billing_system.dto.ApiResponse;
import com.waterbilling1.water_billing_system.entity.Alert;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.AlertRepository;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.serviceImpl.AlertScheduledService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartment-admin/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRepository alertRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final AlertScheduledService alertScheduledService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getAlerts(@AuthenticationPrincipal CustomUserDetails principal) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<AlertResponse> alerts = alertRepository.findByApartment_IdOrderByTriggeredAtDesc(admin.getApartment().getId())
                .stream().map(this::toResponse).toList();

        return ResponseEntity.ok(ApiResponse.success("Alerts fetched.", alerts));
    }

    // Manual trigger for testing without waiting for the 7 AM schedule
    @PostMapping("/run-check-now")
    public ResponseEntity<ApiResponse<Void>> runNow() {
        alertScheduledService.runDailyAlertCheck();
        return ResponseEntity.ok(ApiResponse.success("Alert check executed."));
    }

    private AlertResponse toResponse(Alert a) {
        return AlertResponse.builder()
                .id(a.getId())
                .householdName(a.getHouseholdUser().getFullName())
                .flatNumber(a.getHouseholdUser().getFlatNumber())
                .alertType(a.getAlertType())
                .message(a.getMessage())
                .triggerValue(a.getTriggerValue())
                .resolved(a.getResolved())
                .triggeredAt(a.getTriggeredAt())
                .build();
    }

    @PostMapping("/run-late-fee-check-now")
    public ResponseEntity<ApiResponse<Void>> runLateFeeCheckNow() {
        alertScheduledService.runLateFeeCheck();
        return ResponseEntity.ok(ApiResponse.success("Late fee check completed."));
    }
}