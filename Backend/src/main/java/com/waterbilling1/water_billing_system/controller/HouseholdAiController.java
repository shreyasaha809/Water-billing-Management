package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.AiAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/household-user/ai-assistant")
@RequiredArgsConstructor
public class HouseholdAiController {

    private final AiAssistantService aiAssistantService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody ChatRequest request) {
        ChatResponse response = aiAssistantService.chat(principal.getId(), "HOUSEHOLD_USER", principal.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Response generated.", response));
    }
}