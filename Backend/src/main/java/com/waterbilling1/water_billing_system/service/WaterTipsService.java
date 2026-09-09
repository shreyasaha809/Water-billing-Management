package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.WaterTipsResponse;

public interface WaterTipsService {
    WaterTipsResponse getTipsForHousehold(Long householdUserId);
}