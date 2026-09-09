package com.waterbilling1.water_billing_system.service;

public interface AiDataToolService {
    String buildDataContext(Long userId, String role, String userMessage);
}