package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.dto.BillingCycleResponse;
import com.waterbilling1.water_billing_system.dto.GenerateBillRequest;
import com.waterbilling1.water_billing_system.entity.*;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.BillingCycleService;
import com.waterbilling1.water_billing_system.service.WaterUsageBillingService;
import com.waterbilling1.water_billing_system.service.BillingDistributionService;
import com.waterbilling1.water_billing_system.dto.DistributionResult;
import com.waterbilling1.water_billing_system.service.EmailService;
import com.waterbilling1.water_billing_system.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BillingCycleServiceImpl implements BillingCycleService {

    private final BillingCycleRepository billingCycleRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final BillRepository billRepository;
    private final WaterUsageBillingService waterUsageBillingService;
    private final BillingDistributionService billingDistributionService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public BillingCycleResponse openCycle(Long apartmentAdminUserId, String cycleName) {
        ApartmentAdmin admin = getAdmin(apartmentAdminUserId);
        Long apartmentId = admin.getApartment().getId();

        BillingCycle cycle = billingCycleRepository.findByApartment_IdAndCycleName(apartmentId, cycleName)
                .orElseGet(() -> BillingCycle.builder()
                        .apartment(admin.getApartment())
                        .cycleName(cycleName)
                        .status("OPEN")
                        .openedAt(LocalDateTime.now())
                        .build());

        return toResponse(billingCycleRepository.save(cycle), apartmentId);
    }

    @Override
    @Transactional
    public BillingCycleResponse finalizeCycle(Long apartmentAdminUserId, String cycleName) {
        ApartmentAdmin admin = getAdmin(apartmentAdminUserId);
        Long apartmentId = admin.getApartment().getId();

        BillingCycle cycle = billingCycleRepository.findByApartment_IdAndCycleName(apartmentId, cycleName)
                .orElseThrow(() -> new ResourceNotFoundException("Billing cycle not found: " + cycleName));

        if (!"OPEN".equals(cycle.getStatus())) {
            throw new IllegalStateException("Only an OPEN cycle can be finalized. Current status: " + cycle.getStatus());
        }

        // Generate bills for every active household that has readings but no bill yet this cycle
        List<HouseholdUser> households = householdUserRepository.findByApartment_Id(apartmentId).stream()
                .filter(h -> "ACTIVE".equals(h.getStatus())).toList();

        int generated = 0;
        for (HouseholdUser h : households) {
            boolean alreadyBilled = billRepository.findByHouseholdUser_IdOrderByGeneratedDateDesc(h.getId())
                    .stream().anyMatch(b -> cycleName.equals(b.getBillingCycle()));
            if (alreadyBilled) continue;

            try {
                waterUsageBillingService.generateMonthlyBill(apartmentAdminUserId,
                        GenerateBillRequest.builder().householdUserId(h.getId()).billingCycle(cycleName).build());
                generated++;
            } catch (IllegalStateException ex) {
                log.info("Skipping bill generation for household {}: {}", h.getId(), ex.getMessage());
            } catch (Exception ex) {
                log.error("Unexpected error generating bill for household {} in cycle {}: {}", h.getId(), cycleName, ex.getMessage(), ex);
            }
        }

        String warning = null;
        try {
            warning = applyDistributionReconciliation(apartmentAdminUserId, cycleName);
        } catch (Exception ex) {
            log.error("Distribution reconciliation failed for cycle {}: {}", cycleName, ex.getMessage(), ex);
            warning = "Shared cost was not applied due to an unexpected error. Check server logs.";
        }

        try {
            sendFinalizedBillEmails(apartmentId, cycleName);
        } catch (Exception ex) {
            log.error("Sending finalized bill emails/notifications failed for cycle {}: {}", cycleName, ex.getMessage(), ex);
        }

        cycle.setStatus("FINALIZED");
        cycle.setFinalizedAt(LocalDateTime.now());
        billingCycleRepository.save(cycle);

        log.info("Finalized cycle {} for apartment {}. Bills generated: {}", cycleName, apartmentId, generated);
        return toResponse(cycle, apartmentId, warning);
    }

    private void sendFinalizedBillEmails(Long apartmentId, String cycleName) {
        List<Bill> bills = billRepository.findByApartment_IdOrderByGeneratedDateDesc(apartmentId).stream()
                .filter(b -> cycleName.equals(b.getBillingCycle()))
                .toList();

        for (Bill bill : bills) {
            HouseholdUser household = bill.getHouseholdUser();
            MeterReading reading = bill.getMeterReading();

            emailService.sendBillGeneratedEmail(
                    household.getEmail(),
                    household.getFullName(),
                    bill.getBillNumber(),
                    cycleName,
                    reading != null ? reading.getPreviousReading() : 0.0,
                    reading != null ? reading.getCurrentReading() : bill.getUsageUnits(),
                    bill.getUsageUnits(),
                    bill.getExtraChargeAmount(),
                    bill.getTier1Amount() + bill.getTier2Amount(),
                    bill.getAmount(),
                    bill.getDueDate()
            );

            notificationService.notify(household, "Water Bill Generated",
                    String.format("Your water bill for %s has been generated.\nTotal Amount Payable: ₹%.2f\nDue Date: %s",
                            cycleName, bill.getAmount(), bill.getDueDate().toLocalDate()),
                    "INFO");
        }
    }

    private String applyDistributionReconciliation(Long apartmentAdminUserId, String cycleName) {
        List<DistributionResult> results;
        try {
            results = billingDistributionService.distributeCycleCost(apartmentAdminUserId, cycleName);
        } catch (IllegalStateException ex) {
            log.info("Skipping distribution reconciliation for cycle {}: {}", cycleName, ex.getMessage());
            return "Shared cost was not applied: " + ex.getMessage();
        }

        for (DistributionResult result : results) {
            billRepository.findByHouseholdUser_IdAndBillingCycle(result.getHouseholdUserId(), cycleName)
                    .ifPresent(bill -> {
                        double extra = Math.max(result.getAllocatedCost() - bill.getAmount(), 0.0);
                        if (extra > 0) {
                            bill.setExtraChargeAmount(extra);
                            bill.setAmount(bill.getAmount() + extra);
                            billRepository.save(bill);
                            log.info("Applied extra charge of {} to household {} for cycle {}",
                                    extra, result.getHouseholdUserId(), cycleName);
                        }
                    });
        }
        return null;
    }

    @Override
    @Transactional
    public BillingCycleResponse archiveCycle(Long apartmentAdminUserId, String cycleName) {
        ApartmentAdmin admin = getAdmin(apartmentAdminUserId);
        Long apartmentId = admin.getApartment().getId();

        BillingCycle cycle = billingCycleRepository.findByApartment_IdAndCycleName(apartmentId, cycleName)
                .orElseThrow(() -> new ResourceNotFoundException("Billing cycle not found: " + cycleName));

        if (!"FINALIZED".equals(cycle.getStatus())) {
            throw new IllegalStateException("Only a FINALIZED cycle can be archived. Current status: " + cycle.getStatus());
        }

        cycle.setStatus("ARCHIVED");
        return toResponse(billingCycleRepository.save(cycle), apartmentId);
    }

    @Override
    public List<BillingCycleResponse> getCyclesForAdmin(Long apartmentAdminUserId) {
        ApartmentAdmin admin = getAdmin(apartmentAdminUserId);
        return billingCycleRepository.findByApartment_IdOrderByOpenedAtDesc(admin.getApartment().getId())
                .stream().map(c -> toResponse(c, admin.getApartment().getId())).toList();
    }

    private ApartmentAdmin getAdmin(Long id) {
        return apartmentAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
    }

    private BillingCycleResponse toResponse(BillingCycle c, Long apartmentId) {
        return toResponse(c, apartmentId, null);
    }

    private BillingCycleResponse toResponse(BillingCycle c, Long apartmentId, String warning) {
        int billCount = (int) billRepository.findByApartment_IdOrderByGeneratedDateDesc(apartmentId)
                .stream().filter(b -> c.getCycleName().equals(b.getBillingCycle())).count();

        return BillingCycleResponse.builder()
                .id(c.getId()).cycleName(c.getCycleName()).status(c.getStatus())
                .openedAt(c.getOpenedAt()).finalizedAt(c.getFinalizedAt())
                .billsGenerated(billCount)
                .warning(warning)
                .build();
    }
}