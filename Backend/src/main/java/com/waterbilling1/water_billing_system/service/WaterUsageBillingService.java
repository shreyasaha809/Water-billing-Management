package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.BillResponse;
import com.waterbilling1.water_billing_system.dto.GenerateBillRequest;
import com.waterbilling1.water_billing_system.dto.MeterReadingResponse;
import com.waterbilling1.water_billing_system.dto.RecordMeterReadingRequest;

import java.util.List;

public interface WaterUsageBillingService {

    MeterReadingResponse recordMeterReading(Long apartmentAdminUserId, RecordMeterReadingRequest request);

    BillResponse generateMonthlyBill(Long apartmentAdminUserId, GenerateBillRequest request);

    List<MeterReadingResponse> getMeterReadingsForAdmin(Long apartmentAdminUserId);

    List<BillResponse> getBillsForAdmin(Long apartmentAdminUserId);

    MeterReadingResponse getLatestReadingForHousehold(Long householdUserId);

    BillResponse getLatestBillForHousehold(Long householdUserId);

    List<BillResponse> getBillHistoryForHousehold(Long householdUserId);

    void deleteBill(Long apartmentAdminUserId, Long billId);
}