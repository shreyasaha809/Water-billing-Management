package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.ApiResponse;
import com.waterbilling1.water_billing_system.dto.ResidentUsageReportResponse;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.waterbilling1.water_billing_system.dto.BillingSummaryReportResponse;
import com.waterbilling1.water_billing_system.dto.CommunityAnalyticsReportResponse;

@RestController
@RequestMapping("/api/apartment-admin/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/resident-usage-comparison")
    public ResponseEntity<ApiResponse<ResidentUsageReportResponse>> getReport(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String billingCycle) {
        return ResponseEntity.ok(ApiResponse.success("Report fetched successfully.",
                reportService.getResidentUsageComparisonReport(principal.getId(), billingCycle)));
    }

    @GetMapping("/resident-usage-comparison/pdf")
    public ResponseEntity<byte[]> downloadPdf(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String billingCycle) {
        byte[] pdf = reportService.generateResidentUsagePdf(principal.getId(), billingCycle);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Resident-Usage-Report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/resident-usage-comparison/excel")
    public ResponseEntity<byte[]> downloadExcel(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(required = false) String billingCycle) {
        byte[] excel = reportService.generateResidentUsageExcel(principal.getId(), billingCycle);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Resident-Usage-Report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/billing-summary")
    public ResponseEntity<ApiResponse<BillingSummaryReportResponse>> getBillingSummary(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Report fetched.", reportService.getBillingSummaryReport(principal.getId())));
    }

    @GetMapping("/billing-summary/pdf")
    public ResponseEntity<byte[]> downloadBillingSummaryPdf(@AuthenticationPrincipal CustomUserDetails principal) {
        byte[] pdf = reportService.generateBillingSummaryPdf(principal.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Billing-Summary-Report.pdf")
                .contentType(MediaType.APPLICATION_PDF).body(pdf);
    }

    @GetMapping("/billing-summary/excel")
    public ResponseEntity<byte[]> downloadBillingSummaryExcel(@AuthenticationPrincipal CustomUserDetails principal) {
        byte[] excel = reportService.generateBillingSummaryExcel(principal.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Billing-Summary-Report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(excel);
    }

    @GetMapping("/community-analytics")
    public ResponseEntity<ApiResponse<CommunityAnalyticsReportResponse>> getCommunityAnalytics(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Report fetched.", reportService.getCommunityAnalyticsReport(principal.getId())));
    }

    @GetMapping("/community-analytics/pdf")
    public ResponseEntity<byte[]> downloadCommunityAnalyticsPdf(@AuthenticationPrincipal CustomUserDetails principal) {
        byte[] pdf = reportService.generateCommunityAnalyticsPdf(principal.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Community-Analytics-Report.pdf")
                .contentType(MediaType.APPLICATION_PDF).body(pdf);
    }

    @GetMapping("/community-analytics/excel")
    public ResponseEntity<byte[]> downloadCommunityAnalyticsExcel(@AuthenticationPrincipal CustomUserDetails principal) {
        byte[] excel = reportService.generateCommunityAnalyticsExcel(principal.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Community-Analytics-Report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(excel);
    }
}