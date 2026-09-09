package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.HouseholdUsageBarPoint;

import java.util.List;

public interface ApartmentAdminChartService {
    List<HouseholdUsageBarPoint> getHouseholdUsageComparison(Long apartmentAdminUserId);
}