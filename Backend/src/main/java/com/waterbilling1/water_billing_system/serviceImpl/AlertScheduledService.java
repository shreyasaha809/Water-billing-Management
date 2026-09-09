package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.service.TariffPlanService;
import com.waterbilling1.water_billing_system.entity.*;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.NotificationService;
import com.waterbilling1.water_billing_system.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertScheduledService {

    private final HouseholdUserRepository householdUserRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final AlertThresholdRepository alertThresholdRepository;
    private final AlertRepository alertRepository;
    private final BillRepository billRepository;
    private final EmailService emailService;
    private final TariffPlanService tariffPlanService;
    private final NotificationService notificationService;

    // Runs once daily at 07:00 server time. Change cron as needed.
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void runDailyAlertCheck() {
        log.info("Running daily alert check...");

        List<HouseholdUser> activeHouseholds = householdUserRepository.findAll().stream()
                .filter(h -> "ACTIVE".equals(h.getStatus()))
                .toList();

        for (HouseholdUser household : activeHouseholds) {
            checkThreshold(household);
            checkLeakOutlier(household);
            checkTariffThreshold(household);

        }

        log.info("Daily alert check complete. Households scanned: {}", activeHouseholds.size());
    }

    @Scheduled(cron = "0 0 8 * * *") // daily 8 AM
    @Transactional
    public void runPaymentDueCheck() {
        List<Bill> unpaidBills = billRepository.findAll().stream()
                .filter(b -> "GENERATED".equals(b.getStatus()) && b.getDueDate() != null)
                .toList();

        for (Bill bill : unpaidBills) {
            long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(
                    LocalDateTime.now().toLocalDate(), bill.getDueDate().toLocalDate());

            HouseholdUser household = bill.getHouseholdUser();

            if (daysRemaining == 3) {
                notificationService.notify(household, "Payment Due Reminder",
                        String.format("Your water bill is due in %d day(s).\nPlease complete the payment before %s to avoid late payment charges.",
                                daysRemaining, bill.getDueDate().toLocalDate()),
                        "WARNING");
            } else if (daysRemaining < 0) {
                notificationService.notify(household, "Payment Overdue",
                        "Your water bill payment is overdue.\nPlease make the payment as soon as possible to avoid additional charges.",
                        "ERROR");
            }
        }
    }

    @Scheduled(cron = "0 0 9 * * *") // daily 9 AM
    @Transactional
    public void runLateFeeCheck() {
        List<Bill> unpaidBills = billRepository.findAll().stream()
                .filter(b -> ("GENERATED".equals(b.getStatus()) || "OVERDUE".equals(b.getStatus())) && b.getDueDate() != null)
                .toList();

        for (Bill bill : unpaidBills) {
            TariffPlan plan = tariffPlanService.getOrCreateDefault(bill.getApartment().getId());
            int intervalDays = (plan.getLateFeeIntervalDays() == null || plan.getLateFeeIntervalDays() <= 0)
                    ? 30 : plan.getLateFeeIntervalDays();

            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(
                    bill.getDueDate().toLocalDate(), LocalDateTime.now().toLocalDate());

            if (daysOverdue < intervalDays) continue;

            int expectedFeeCount = (int) (daysOverdue / intervalDays);
            int alreadyAppliedCount = bill.getLateFeeCount();

            if (expectedFeeCount <= alreadyAppliedCount) continue; // already fully up to date

            int newFeeBlocks = expectedFeeCount - alreadyAppliedCount;

            double feeToAdd = plan.getLateFeeAmount() * newFeeBlocks;

            bill.setAmount(bill.getAmount() + feeToAdd);
            bill.setLateFeeAmount(bill.getLateFeeAmount() + feeToAdd);
            bill.setLateFeeCount(expectedFeeCount);
            bill.setLastLateFeeAppliedAt(LocalDateTime.now());
            billRepository.save(bill);

            HouseholdUser household = bill.getHouseholdUser();

            emailService.sendAlertEmail(household.getEmail(),
                    "Late Payment Fee Applied",
                    String.format("Hello %s,\n\nA late payment fee of ₹%.2f has been added to your bill %s (billing cycle %s), reflecting %d overdue period(s) of %d day(s) each past the due date.\n\nNew Total Amount Due: ₹%.2f\n\nPlease make payment as soon as possible to avoid further charges.\n\nThank you.",
                            household.getFullName(), feeToAdd, bill.getBillNumber(), bill.getBillingCycle(), expectedFeeCount, intervalDays, bill.getAmount()));

            notificationService.notify(household, "Late Payment Fee Applied",
                    String.format("A late payment fee of ₹%.2f has been added to your bill %s (%d month(s) overdue).\nNew Total Amount Due: ₹%.2f",
                            feeToAdd, bill.getBillNumber(), expectedFeeCount, bill.getAmount()),
                    "ERROR");

            log.info("Applied late fee of {} (block {} of {}) to bill {} (household {})",
                    feeToAdd, expectedFeeCount, expectedFeeCount, bill.getBillNumber(), household.getId());
        }
    }

    private void checkThreshold(HouseholdUser household) {
        var latestReadingOpt = meterReadingRepository
                .findTopByHouseholdUser_IdOrderByReadingDateDesc(household.getId());
        if (latestReadingOpt.isEmpty()) return;

        MeterReading latest = latestReadingOpt.get();

        double threshold = alertThresholdRepository.findByApartment_Id(household.getApartment().getId())
                .map(AlertThreshold::getDailyUsageThresholdLiters)
                .orElse(500.0);

        if (latest.getUsageUnits() > threshold) {
            if (alertRepository.existsByHouseholdUser_IdAndAlertTypeAndMeterReadingId(
                    household.getId(), "THRESHOLD_EXCEEDED", latest.getId())) {
                return; // already alerted for this exact reading, don't repeat
            }

            String msg = String.format(
                    "%s (Flat %s) used %.1f L on %s, exceeding the threshold of %.1f L.",
                    household.getFullName(), household.getFlatNumber(), latest.getUsageUnits(),
                    latest.getReadingDate(), threshold);

            saveAlert(household, "THRESHOLD_EXCEEDED", msg, latest.getUsageUnits(), latest.getId());

            emailService.sendAlertEmail(household.getEmail(),
                    "High Water Usage Alert",
                    "Hello " + household.getFullName() + ",\n\n" + msg + "\n\nPlease check for possible leaks or unusual usage.\n\nThank you.");

            notificationService.notify(household, "High Water Usage Detected",
                    "Your recent water usage exceeded the configured daily threshold.\nPlease monitor your water consumption.",
                    "WARNING");
        }
    }

    private void checkLeakOutlier(HouseholdUser household) {
        List<MeterReading> history = meterReadingRepository
                .findByHouseholdUser_IdOrderByReadingDateDesc(household.getId());

        if (history.size() < 5) return; // not enough history for meaningful stats

        MeterReading latest = history.get(0);
        List<MeterReading> priorReadings = history.subList(1, history.size());

        double mean = priorReadings.stream().mapToDouble(MeterReading::getUsageUnits).average().orElse(0.0);
        double variance = priorReadings.stream()
                .mapToDouble(r -> Math.pow(r.getUsageUnits() - mean, 2))
                .average().orElse(0.0);
        double stdDev = Math.sqrt(variance);

        double outlierThreshold = mean + (2 * stdDev);

        if (stdDev > 0 && latest.getUsageUnits() > outlierThreshold) {
            if (alertRepository.existsByHouseholdUser_IdAndAlertTypeAndMeterReadingId(
                    household.getId(), "LEAK_SUSPECTED", latest.getId())) {
                return; // already alerted for this exact reading, don't repeat
            }

            String msg = String.format(
                    "%s (Flat %s) used %.1f L on %s, more than 2 standard deviations above their average of %.1f L — possible leak.",
                    household.getFullName(), household.getFlatNumber(), latest.getUsageUnits(), latest.getReadingDate(), mean);

            saveAlert(household, "LEAK_SUSPECTED", msg, latest.getUsageUnits(), latest.getId());

            emailService.sendAlertEmail(household.getEmail(),
                    "Possible Leak Detected",
                    "Hello " + household.getFullName() + ",\n\n" + msg + "\n\nWe recommend inspecting your plumbing for leaks.\n\nThank you.");

            notificationService.notify(household, "Possible Water Leak Detected",
                    "Unusual water usage has been detected.\nPlease inspect your plumbing system for possible leaks.",
                    "ERROR");
        }
    }

    private void saveAlert(HouseholdUser household, String type, String message, double value, Long meterReadingId) {
        Alert alert = Alert.builder()
                .householdUser(household)
                .apartment(household.getApartment())
                .alertType(type)
                .message(message)
                .triggerValue(value)
                .resolved(false)
                .triggeredAt(LocalDateTime.now())
                .meterReadingId(meterReadingId)
                .build();
        alertRepository.save(alert);
    }
    private void checkTariffThreshold(HouseholdUser household) {
        var latestReadingOpt = meterReadingRepository
                .findTopByHouseholdUser_IdOrderByReadingDateDesc(household.getId());
        if (latestReadingOpt.isEmpty()) return;

        String billingCycle = latestReadingOpt.get().getBillingCycle();

        List<MeterReading> cycleReadings = meterReadingRepository
                .findByHouseholdUser_IdAndBillingCycleOrderByReadingDateAsc(household.getId(), billingCycle);

        double totalUsage = cycleReadings.stream().mapToDouble(MeterReading::getUsageUnits).sum();

        TariffPlan plan = tariffPlanService.getOrCreateDefault(household.getApartment().getId());

        if (totalUsage <= plan.getBaseTierLimitLiters()) return;

        if (alertRepository.existsByHouseholdUser_IdAndAlertTypeAndBillingCycle(
                household.getId(), "TARIFF_THRESHOLD_EXCEEDED", billingCycle)) {
            return; // already alerted for this household + cycle, don't resend
        }

        String msg = String.format(
                "%s (Flat %s) has used %.1f L in billing cycle %s, exceeding the base tariff limit of %.1f L. Usage above this is charged at the higher rate.",
                household.getFullName(), household.getFlatNumber(), totalUsage, billingCycle, plan.getBaseTierLimitLiters());

        Alert alert = Alert.builder()
                .householdUser(household)
                .apartment(household.getApartment())
                .alertType("TARIFF_THRESHOLD_EXCEEDED")
                .message(msg)
                .triggerValue(totalUsage)
                .resolved(false)
                .triggeredAt(LocalDateTime.now())
                .billingCycle(billingCycle)
                .build();
        alertRepository.save(alert);

        emailService.sendAlertEmail(household.getEmail(),
                "Water Usage Threshold Exceeded",
                "Hello " + household.getFullName() + ",\n\n" + msg +
                        "\n\nConsider monitoring your usage to manage costs for the rest of this billing cycle.\n\nThank you.");

        notificationService.notify(household, "Higher Tariff Applied",
                "Your water usage has exceeded the base tariff limit.\nAdditional usage will be charged at the higher tariff rate.",
                "WARNING");
    }



}