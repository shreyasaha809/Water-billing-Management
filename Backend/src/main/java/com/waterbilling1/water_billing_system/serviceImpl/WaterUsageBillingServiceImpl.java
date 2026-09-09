package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.BillResponse;
import com.waterbilling1.water_billing_system.dto.GenerateBillRequest;
import com.waterbilling1.water_billing_system.dto.MeterReadingResponse;
import com.waterbilling1.water_billing_system.dto.RecordMeterReadingRequest;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.Bill;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.MeterReading;
import com.waterbilling1.water_billing_system.entity.TariffPlan;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.BillRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.MeterReadingRepository;
import com.waterbilling1.water_billing_system.service.TariffPlanService;
import com.waterbilling1.water_billing_system.service.WaterUsageBillingService;
import com.waterbilling1.water_billing_system.service.EmailService;
import com.waterbilling1.water_billing_system.service.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WaterUsageBillingServiceImpl implements WaterUsageBillingService {

    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final TariffPlanService tariffPlanService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public MeterReadingResponse recordMeterReading(Long apartmentAdminUserId, RecordMeterReadingRequest request) {

        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        HouseholdUser household = householdUserRepository
                .findByIdAndApartment_Id(request.getHouseholdUserId(), admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Household not found in your apartment with ID: " + request.getHouseholdUserId()));

        if (!"ACTIVE".equals(household.getStatus())) {
            throw new IllegalStateException("Cannot record a reading: this household has been removed.");
        }

        Double previousReading = meterReadingRepository
                .findTopByHouseholdUser_IdOrderByReadingDateDesc(household.getId())
                .map(MeterReading::getCurrentReading)
                .orElse(0.0);

        if (request.getCurrentReading() < previousReading) {
            throw new IllegalArgumentException(
                    "Current reading (" + request.getCurrentReading() +
                            ") cannot be less than the previous reading (" + previousReading + ").");
        }

        double usage = request.getCurrentReading() - previousReading;

        MeterReading reading = MeterReading.builder()
                .householdUser(household)
                .apartment(admin.getApartment())
                .previousReading(previousReading)
                .currentReading(request.getCurrentReading())
                .usageUnits(usage)
                .billingCycle(request.getBillingCycle())
                .readingDate(LocalDate.now())
                .build();

        MeterReading savedReading = meterReadingRepository.save(reading);

        // Recording a reading immediately (re)generates the bill for that household + cycle,
        // recalculated from all readings logged so far in that cycle.
        upsertBillForCycle(admin, household, request.getBillingCycle(), request.getBillGeneratedDate());

        notificationService.notify(household, "Meter Reading Recorded",
                "Your latest meter reading has been recorded successfully for the current billing cycle.",
                "INFO");

        return toReadingResponse(savedReading);
    }

    @Override
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public BillResponse generateMonthlyBill(Long apartmentAdminUserId, GenerateBillRequest request) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        HouseholdUser household = householdUserRepository
                .findByIdAndApartment_Id(request.getHouseholdUserId(), admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Household not found in your apartment with ID: " + request.getHouseholdUserId()));

        List<MeterReading> readings = meterReadingRepository
                .findByHouseholdUser_IdAndBillingCycleOrderByReadingDateAsc(household.getId(), request.getBillingCycle());

        if (readings.isEmpty()) {
            throw new IllegalStateException(
                    "No meter readings found for " + household.getFullName() +
                            " in billing cycle " + request.getBillingCycle() + ". Record daily readings first.");
        }

        Bill savedBill = upsertBillForCycle(admin, household, request.getBillingCycle(), request.getBillGeneratedDate());

        return toBillResponse(savedBill);
    }

    @Override
    public List<MeterReadingResponse> getMeterReadingsForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        return meterReadingRepository.findByApartment_IdOrderByReadingDateDesc(admin.getApartment().getId())
                .stream().map(this::toReadingResponse).toList();
    }

    @Override
    public List<BillResponse> getBillsForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        return billRepository.findByApartment_IdOrderByGeneratedDateDesc(admin.getApartment().getId())
                .stream().map(this::toBillResponse).toList();
    }

    @Override
    public MeterReadingResponse getLatestReadingForHousehold(Long householdUserId) {
        return meterReadingRepository.findTopByHouseholdUser_IdOrderByReadingDateDesc(householdUserId)
                .map(this::toReadingResponse)
                .orElse(null);
    }

    @Override
    public BillResponse getLatestBillForHousehold(Long householdUserId) {
        return billRepository.findTopByHouseholdUser_IdOrderByGeneratedDateDesc(householdUserId)
                .map(this::toBillResponse)
                .orElse(null);
    }

    @Override
    public List<BillResponse> getBillHistoryForHousehold(Long householdUserId) {
        return billRepository.findByHouseholdUser_IdOrderByGeneratedDateDesc(householdUserId)
                .stream().map(this::toBillResponse).toList();
    }

    @Override
    @Transactional
    public void deleteBill(Long apartmentAdminUserId, Long billId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Logged-in Apartment Admin not found."));

        Bill bill = billRepository.findByIdAndApartment_Id(billId, admin.getApartment().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bill not found in your apartment with ID: " + billId));

        billRepository.delete(bill);
    }

    private MeterReadingResponse toReadingResponse(MeterReading r) {
        return MeterReadingResponse.builder()
                .id(r.getId())
                .householdUserName(r.getHouseholdUser().getFullName())
                .flatNumber(r.getHouseholdUser().getFlatNumber())
                .previousReading(r.getPreviousReading())
                .currentReading(r.getCurrentReading())
                .usageUnits(r.getUsageUnits())
                .billingCycle(r.getBillingCycle())
                .readingDate(r.getReadingDate())
                .build();
    }

    private Bill upsertBillForCycle(ApartmentAdmin admin, HouseholdUser household, String billingCycle, LocalDate billGeneratedDate) {
        List<MeterReading> readings = meterReadingRepository
                .findByHouseholdUser_IdAndBillingCycleOrderByReadingDateAsc(household.getId(), billingCycle);

        double totalUsage = readings.stream().mapToDouble(MeterReading::getUsageUnits).sum();

        TariffPlan plan = tariffPlanService.getOrCreateDefault(admin.getApartment().getId());

        double baseUsage = Math.min(totalUsage, plan.getBaseTierLimitLiters());
        double higherUsage = Math.max(totalUsage - plan.getBaseTierLimitLiters(), 0);
        double amount = (baseUsage * plan.getBaseRate()) + (higherUsage * plan.getHigherRate());

        LocalDateTime generatedDate = billGeneratedDate != null
                ? billGeneratedDate.atStartOfDay()
                : LocalDateTime.now();

        Bill bill = billRepository.findByHouseholdUser_IdAndBillingCycle(household.getId(), billingCycle)
                .orElseGet(() -> Bill.builder()
                        .householdUser(household)
                        .apartment(admin.getApartment())
                        .billingCycle(billingCycle)
                        .billNumber("TEMP")
                        .status("GENERATED")
                        .build());

        // A bill may already have shared-cost distribution and/or a late fee applied
        // (from finalizeCycle's reconciliation step or the daily late-fee job) before
        // this method runs again — e.g. a meter reading correction re-generates the bill.
        // Preserve those amounts instead of wiping them out of the total below.
        double previousExtraCharge = bill.getExtraChargeAmount() != null ? bill.getExtraChargeAmount() : 0.0;
        double previousLateFee = bill.getLateFeeAmount() != null ? bill.getLateFeeAmount() : 0.0;

        MeterReading latestReading = readings.get(readings.size() - 1);

        bill.setMeterReading(latestReading);
        bill.setUsageUnits(totalUsage);
        bill.setRatePerUnit(totalUsage > 0 ? amount / totalUsage : plan.getBaseRate());
        bill.setAmount(amount + previousExtraCharge + previousLateFee);
        bill.setGeneratedDate(generatedDate);

        // Due Date = Bill Generation Date + the Tariff Plan's configured billing interval
        // (the same "Late Fee Interval (days)" field configured on the Tariff Plan page).
        // Falls back to 30 days only if the plan has no valid interval configured, matching
        // the same fallback already used by the late-fee scheduled job.
        int billingIntervalDays = (plan.getLateFeeIntervalDays() == null || plan.getLateFeeIntervalDays() <= 0)
                ? 30 : plan.getLateFeeIntervalDays();
        bill.setDueDate(generatedDate.plusDays(billingIntervalDays));

        bill.setTier1Usage(baseUsage);
        bill.setTier1Rate(plan.getBaseRate());
        bill.setTier1Amount(baseUsage * plan.getBaseRate());
        bill.setTier2Usage(higherUsage);
        bill.setTier2Rate(plan.getHigherRate());
        bill.setTier2Amount(higherUsage * plan.getHigherRate());

        Bill savedBill = billRepository.save(bill);
        if ("TEMP".equals(savedBill.getBillNumber())) {
            savedBill.setBillNumber(String.format("BILL-%06d", savedBill.getId()));
            savedBill = billRepository.save(savedBill);
        }
        return savedBill;
    }

    private BillResponse toBillResponse(Bill b) {
        return BillResponse.builder()
                .id(b.getId())
                .billNumber(b.getBillNumber())
                .householdUserName(b.getHouseholdUser().getFullName())
                .flatNumber(b.getHouseholdUser().getFlatNumber())
                .billingCycle(b.getBillingCycle())
                .usageUnits(b.getUsageUnits())
                .ratePerUnit(b.getRatePerUnit())
                .amount(b.getAmount())
                .status(b.getStatus())
                .generatedDate(b.getGeneratedDate())
                .dueDate(b.getDueDate())
                .tier1Usage(b.getTier1Usage())
                .tier1Rate(b.getTier1Rate())
                .tier1Amount(b.getTier1Amount())
                .tier2Usage(b.getTier2Usage())
                .tier2Rate(b.getTier2Rate())
                .tier2Amount(b.getTier2Amount())
                .extraChargeAmount(b.getExtraChargeAmount())
                .lateFeeAmount(b.getLateFeeAmount())
                .lateFeeCount(b.getLateFeeCount())
                .build();
    }
}