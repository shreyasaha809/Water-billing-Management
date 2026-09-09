package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.TariffPlanRequest;
import com.waterbilling1.water_billing_system.dto.TariffPlanResponse;
import com.waterbilling1.water_billing_system.entity.TariffPlan;

public interface TariffPlanService {
    TariffPlanResponse getTariffPlan(Long apartmentAdminUserId);
    TariffPlanResponse updateTariffPlan(Long apartmentAdminUserId, TariffPlanRequest request);
    TariffPlan getOrCreateDefault(Long apartmentId); // used internally by billing engine
}