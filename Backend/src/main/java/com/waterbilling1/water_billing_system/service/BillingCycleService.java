package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.BillingCycleResponse;
import java.util.List;

public interface BillingCycleService {
    BillingCycleResponse openCycle(Long apartmentAdminUserId, String cycleName);
    BillingCycleResponse finalizeCycle(Long apartmentAdminUserId, String cycleName);
    BillingCycleResponse archiveCycle(Long apartmentAdminUserId, String cycleName);
    List<BillingCycleResponse> getCyclesForAdmin(Long apartmentAdminUserId);
}