package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.ApiResponse;
import com.waterbilling1.water_billing_system.dto.OrganizationReportResponse;
import com.waterbilling1.water_billing_system.service.SuperAdminReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin/reports")
@RequiredArgsConstructor
public class SuperAdminReportController {

    private final SuperAdminReportService superAdminReportService;

    @GetMapping("/organization")
    public ResponseEntity<ApiResponse<OrganizationReportResponse>> getReport() {
        return ResponseEntity.ok(ApiResponse.success("Report fetched.", superAdminReportService.getOrganizationReport()));
    }

    @GetMapping("/organization/pdf")
    public ResponseEntity<byte[]> downloadPdf() {
        byte[] pdf = superAdminReportService.generateOrganizationPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Organization-Report.pdf")
                .contentType(MediaType.APPLICATION_PDF).body(pdf);
    }

    @GetMapping("/organization/excel")
    public ResponseEntity<byte[]> downloadExcel() {
        byte[] excel = superAdminReportService.generateOrganizationExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Organization-Report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(excel);
    }
}