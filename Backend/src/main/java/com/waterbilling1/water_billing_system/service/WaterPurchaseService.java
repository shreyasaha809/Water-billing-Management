package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.RecordWaterPurchaseRequest;
import com.waterbilling1.water_billing_system.dto.WaterPurchaseResponse;

import java.util.List;

public interface WaterPurchaseService {
    WaterPurchaseResponse recordPurchase(Long apartmentAdminUserId, RecordWaterPurchaseRequest request);
    List<WaterPurchaseResponse> getPurchasesForAdmin(Long apartmentAdminUserId);
}