package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.DailyUsagePoint;
import com.waterbilling1.water_billing_system.dto.MonthlyUsagePoint;
import com.waterbilling1.water_billing_system.dto.UsageComparisonResponse;

import java.util.List;

public interface HouseholdChartService {
    List<DailyUsagePoint> getDailyUsage(Long householdUserId);
    List<MonthlyUsagePoint> getMonthlyUsage(Long householdUserId);
    UsageComparisonResponse getUsageComparison(Long householdUserId);
}