package com.waterbilling1.water_billing_system.service;

public interface AiProvider {
    String generateReply(String systemPrompt, String userMessage);
}