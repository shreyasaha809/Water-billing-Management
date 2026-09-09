package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.DistributionResult;

import java.util.List;

public interface BillingDistributionService {
    List<DistributionResult> distributeCycleCost(Long apartmentAdminUserId, String billingCycle);
}