package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.OrganizationReportResponse;

public interface SuperAdminReportService {
    OrganizationReportResponse getOrganizationReport();
    byte[] generateOrganizationPdf();
    byte[] generateOrganizationExcel();
}