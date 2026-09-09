package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.ChatRequest;
import com.waterbilling1.water_billing_system.dto.ChatResponse;

public interface AiAssistantService {
    ChatResponse chat(Long userId, String role, String fullName, ChatRequest request);
}