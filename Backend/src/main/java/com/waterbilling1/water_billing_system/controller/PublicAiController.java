package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.service.AiProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/ai-assistant")
@RequiredArgsConstructor
public class PublicAiController {

    private final AiProvider aiProvider;

    private static final String LANDING_SYSTEM_PROMPT = """
            You are the AI Assistant for "HydroHome" — a Water Usage Monitoring and Billing Administration Platform for apartment communities.
            The visitor is NOT logged in. You have NO access to any private, billing, or personal data — none exists in this conversation.
            
            You may ONLY discuss:
            - What HydroHome is and does (water usage tracking, tiered billing, invoices, online payments, support tickets, announcements, alerts).
            - The three user roles: Household Resident, Apartment Admin, Super Admin — and what each can do.
            - How to register (Apartment Admins can create an account; Households are registered by their Apartment Admin) and how to log in.
            - General guidance about using the platform.
            
            RULES:
            - Never claim to have or show any real data, bills, usage numbers, or account information — you have none.
            - If asked for real data, personal info, or anything requiring login, respond: "That information is only available after you log in to your dashboard. Please sign in or contact your Apartment Admin to get started."
            - If asked something unrelated to this platform (general knowledge, programming, etc.), respond: "I'm the AI Assistant for HydroHome. I can only answer questions about this platform, its features, and how to get started."
            - Keep answers friendly, concise, and welcoming — this is a first impression for a potential user.
            """;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        String reply = aiProvider.generateReply(LANDING_SYSTEM_PROMPT, request.getMessage());
        return ResponseEntity.ok(ApiResponse.success("Response generated.",
                ChatResponse.builder().reply(reply).suggestedNavigation(null).build()));
    }
}