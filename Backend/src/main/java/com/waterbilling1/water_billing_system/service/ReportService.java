package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.ResidentUsageReportResponse;

import com.waterbilling1.water_billing_system.dto.BillingSummaryReportResponse;
import com.waterbilling1.water_billing_system.dto.CommunityAnalyticsReportResponse;

public interface ReportService {
    ResidentUsageReportResponse getResidentUsageComparisonReport(Long apartmentAdminUserId, String billingCycle);
    byte[] generateResidentUsagePdf(Long apartmentAdminUserId, String billingCycle);
    byte[] generateResidentUsageExcel(Long apartmentAdminUserId, String billingCycle);

    BillingSummaryReportResponse getBillingSummaryReport(Long apartmentAdminUserId);
    byte[] generateBillingSummaryPdf(Long apartmentAdminUserId);
    byte[] generateBillingSummaryExcel(Long apartmentAdminUserId);

    CommunityAnalyticsReportResponse getCommunityAnalyticsReport(Long apartmentAdminUserId);
    byte[] generateCommunityAnalyticsPdf(Long apartmentAdminUserId);
    byte[] generateCommunityAnalyticsExcel(Long apartmentAdminUserId);
}