package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.entity.*;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.AiDataToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiDataToolServiceImpl implements AiDataToolService {

    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final SupportTicketRepository ticketRepository;
    private final AnnouncementRepository announcementRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final AlertRepository alertRepository;
    private final ApartmentRepository apartmentRepository;
    private final SuperAdminRepository superAdminRepository;

    @Override
    public String buildDataContext(Long userId, String role, String userMessage) {
        return switch (role) {
            case "HOUSEHOLD_USER" -> buildHouseholdContext(userId);
            case "APARTMENT_ADMIN" -> buildAdminContext(userId);
            case "SUPER_ADMIN" -> buildSuperAdminContext();
            default -> "No data context available.";
        };
    }

    private String buildHouseholdContext(Long householdUserId) {
        HouseholdUser household = householdUserRepository.findById(householdUserId).orElse(null);
        if (household == null) return "No household data found.";

        StringBuilder sb = new StringBuilder();
        sb.append("Household: ").append(household.getFullName()).append(", Flat ").append(household.getFlatNumber()).append("\n");

        billRepository.findTopByHouseholdUser_IdOrderByGeneratedDateDesc(householdUserId).ifPresent(b ->
                sb.append("Latest bill: ").append(b.getBillNumber()).append(", Cycle ").append(b.getBillingCycle())
                        .append(", Amount ₹").append(b.getAmount()).append(", Status ").append(b.getStatus()).append("\n"));

        List<Bill> unpaid = billRepository.findByHouseholdUser_IdOrderByGeneratedDateDesc(householdUserId).stream()
                .filter(b -> !"PAID".equals(b.getStatus())).toList();
        sb.append("Unpaid bills: ").append(unpaid.size()).append("\n");
        unpaid.forEach(b -> sb.append("  - ").append(b.getBillNumber()).append(": ₹").append(b.getAmount()).append(" (").append(b.getStatus()).append(")\n"));

        meterReadingRepository.findTopByHouseholdUser_IdOrderByReadingDateDesc(householdUserId).ifPresent(r ->
                sb.append("Latest/current meter reading: ").append(r.getUsageUnits()).append(" L on ").append(r.getReadingDate())
                        .append(" (this is TODAY's or the MOST RECENT single reading only, not the total)\n"));

        List<MeterReading> allReadings = meterReadingRepository.findByHouseholdUser_IdOrderByReadingDateDesc(householdUserId);
        double totalUsage = allReadings.stream().mapToDouble(MeterReading::getUsageUnits).sum();
        sb.append("OVERALL/TOTAL water usage across ALL recorded history (").append(allReadings.size())
                .append(" readings, from account start until now): ").append(totalUsage).append(" L\n");
        if (!allReadings.isEmpty()) {
            sb.append("Earliest recorded reading date: ").append(allReadings.get(allReadings.size() - 1).getReadingDate()).append("\n");
        }

        long pendingTickets = ticketRepository.findByHouseholdUser_IdOrderByCreatedAtDesc(householdUserId).stream()
                .filter(t -> !List.of("RESOLVED", "CLOSED").contains(t.getStatus())).count();
        sb.append("Open support tickets: ").append(pendingTickets).append("\n");

        List<Announcement> announcements = announcementRepository
                .findByApartment_IdAndIsActiveTrueOrderByPublishDateDesc(household.getApartment().getId());
        sb.append("Recent announcements: ").append(announcements.size()).append("\n");
        announcements.stream().limit(3).forEach(a -> sb.append("  - ").append(a.getTitle()).append(" (").append(a.getPriority()).append(")\n"));

        List<Payment> payments = paymentRepository.findByHouseholdUser_IdOrderByPaymentDateDesc(householdUserId);
        sb.append("Total payments made: ").append(payments.size()).append("\n");

        return sb.toString();
    }

    private String buildAdminContext(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId).orElse(null);
        if (admin == null) return "No admin data found.";
        Long apartmentId = admin.getApartment().getId();

        StringBuilder sb = new StringBuilder();
        sb.append("=== MANAGEMENT DATA FOR THIS APARTMENT/COMMUNITY (fully accessible to this Apartment/Community Admin) ===\n");
        sb.append("Apartment/Community name: ").append(admin.getApartment().getApartmentName()).append("\n");

        List<HouseholdUser> households = householdUserRepository.findByApartment_IdAndStatus(apartmentId, "ACTIVE");
        sb.append("Total residents/households under management: ").append(households.size()).append("\n");

        List<Bill> bills = billRepository.findByApartment_IdOrderByGeneratedDateDesc(apartmentId);
        List<Bill> unpaid = bills.stream().filter(b -> !"PAID".equals(b.getStatus())).toList();
        List<Bill> overdue = bills.stream().filter(b -> "OVERDUE".equals(b.getStatus())).toList();
        List<Bill> paid = bills.stream().filter(b -> "PAID".equals(b.getStatus())).toList();
        double totalBilled = bills.stream().mapToDouble(Bill::getAmount).sum();
        double totalCollected = paid.stream().mapToDouble(Bill::getAmount).sum();

        sb.append("Total bills ever generated: ").append(bills.size()).append("\n");
        sb.append("Paid bills: ").append(paid.size()).append(", Unpaid bills: ").append(unpaid.size())
                .append(", Overdue bills: ").append(overdue.size()).append("\n");
        sb.append("Total billed amount (all-time): ₹").append(totalBilled).append("\n");
        sb.append("Total collected/revenue (all-time, from PAID bills): ₹").append(totalCollected).append("\n");

        // Current and previous billing cycle breakdown
        List<String> cyclesPresent = bills.stream().map(Bill::getBillingCycle).distinct().sorted().toList();
        if (!cyclesPresent.isEmpty()) {
            String latestCycle = cyclesPresent.get(cyclesPresent.size() - 1);
            double latestCycleTotal = bills.stream().filter(b -> latestCycle.equals(b.getBillingCycle())).mapToDouble(Bill::getAmount).sum();
            sb.append("Most recent billing cycle: ").append(latestCycle).append(", total billed that cycle: ₹").append(latestCycleTotal).append("\n");

            if (cyclesPresent.size() > 1) {
                String prevCycle = cyclesPresent.get(cyclesPresent.size() - 2);
                double prevCycleTotal = bills.stream().filter(b -> prevCycle.equals(b.getBillingCycle())).mapToDouble(Bill::getAmount).sum();
                sb.append("Previous billing cycle: ").append(prevCycle).append(", total billed that cycle: ₹").append(prevCycleTotal).append("\n");
            }
        }

        // Highest/lowest consumer, resident-wise usage
        Bill highest = bills.stream().max((a, b) -> Double.compare(a.getUsageUnits(), b.getUsageUnits())).orElse(null);
        Bill lowest = bills.stream().min((a, b) -> Double.compare(a.getUsageUnits(), b.getUsageUnits())).orElse(null);
        if (highest != null) {
            sb.append("Highest water-consuming resident: ").append(highest.getHouseholdUser().getFullName())
                    .append(" (Flat ").append(highest.getHouseholdUser().getFlatNumber()).append("), ").append(highest.getUsageUnits())
                    .append(" L in cycle ").append(highest.getBillingCycle()).append("\n");
        }
        if (lowest != null) {
            sb.append("Lowest water-consuming resident: ").append(lowest.getHouseholdUser().getFullName())
                    .append(" (Flat ").append(lowest.getHouseholdUser().getFlatNumber()).append("), ").append(lowest.getUsageUnits())
                    .append(" L in cycle ").append(lowest.getBillingCycle()).append("\n");
        }

        sb.append("Resident-wise / apartment-wise water usage (recent bills):\n");
        bills.stream().limit(15).forEach(b ->
                sb.append("  - ").append(b.getHouseholdUser().getFullName()).append(" (Flat ").append(b.getHouseholdUser().getFlatNumber())
                        .append("): ").append(b.getUsageUnits()).append(" L, ₹").append(b.getAmount())
                        .append(", ").append(b.getStatus()).append(", cycle ").append(b.getBillingCycle()).append("\n"));

        // Water purchase totals
        List<WaterPurchase> purchases = waterPurchaseRepository.findByApartment_Id(apartmentId);
        double totalPurchasedLiters = purchases.stream().mapToDouble(WaterPurchase::getVolumePurchasedLiters).sum();
        double totalPurchaseCost = purchases.stream().mapToDouble(WaterPurchase::getTotalCost).sum();
        sb.append("Total water purchased (all-time): ").append(totalPurchasedLiters).append(" L, total cost: ₹").append(totalPurchaseCost).append("\n");

        // Support tickets / complaints
        List<SupportTicket> tickets = ticketRepository.findByApartment_IdOrderByCreatedAtDesc(apartmentId);
        long pendingTickets = tickets.stream().filter(t -> "PENDING".equals(t.getStatus())).count();
        long activeTickets = tickets.stream().filter(t -> !List.of("RESOLVED", "CLOSED").contains(t.getStatus())).count();
        sb.append("Total support tickets/complaints: ").append(tickets.size())
                .append(", Pending: ").append(pendingTickets).append(", Active/unresolved: ").append(activeTickets).append("\n");

        // Leak alerts
        List<Alert> alerts = alertRepository.findByApartment_IdOrderByTriggeredAtDesc(apartmentId);
        long leaks = alerts.stream().filter(a -> "LEAK_SUSPECTED".equals(a.getAlertType())).count();
        long thresholdAlerts = alerts.stream().filter(a -> "THRESHOLD_EXCEEDED".equals(a.getAlertType())).count();
        sb.append("Total alerts: ").append(alerts.size()).append(" (Possible leaks: ").append(leaks)
                .append(", Threshold exceeded: ").append(thresholdAlerts).append(")\n");

        // Announcements
        List<Announcement> announcements = announcementRepository.findByApartment_IdOrderByPublishDateDesc(apartmentId);
        sb.append("Total community announcements published: ").append(announcements.size()).append("\n");
        announcements.stream().limit(5).forEach(a ->
                sb.append("  - ").append(a.getTitle()).append(" (").append(a.getPriority()).append(", ").append(a.getPublishDate()).append(")\n"));

        return sb.toString();
    }

    private String buildSuperAdminContext() {
        StringBuilder sb = new StringBuilder();
        sb.append("=== ORGANIZATION-WIDE DATA (fully accessible to Super Admin, across ALL apartments/communities) ===\n");

        long totalApartments = apartmentRepository.count();
        long totalHouseholds = householdUserRepository.count();
        long totalAdmins = apartmentAdminRepository.count();

        sb.append("Total communities/apartments: ").append(totalApartments).append("\n");
        sb.append("Total household users (residents): ").append(totalHouseholds).append("\n");
        sb.append("Total apartment admins: ").append(totalAdmins).append("\n");
        sb.append("Total users overall (residents + admins): ").append(totalHouseholds + totalAdmins).append("\n");

        List<Bill> allBills = billRepository.findAll();
        List<Bill> paid = allBills.stream().filter(b -> "PAID".equals(b.getStatus())).toList();
        List<Bill> unpaid = allBills.stream().filter(b -> !"PAID".equals(b.getStatus())).toList();
        double totalRevenue = paid.stream().mapToDouble(Bill::getAmount).sum();
        double totalBilled = allBills.stream().mapToDouble(Bill::getAmount).sum();
        double totalConsumption = allBills.stream().mapToDouble(Bill::getUsageUnits).sum();

        sb.append("Total bills generated (system-wide): ").append(allBills.size())
                .append(" (Paid: ").append(paid.size()).append(", Unpaid: ").append(unpaid.size()).append(")\n");
        sb.append("Total billed amount (system-wide): ₹").append(totalBilled).append("\n");
        sb.append("Total revenue collected (system-wide): ₹").append(totalRevenue).append("\n");
        sb.append("Total water consumption tracked (system-wide, all bills): ").append(totalConsumption).append(" L\n");

        // Community-wise comparison — usage and revenue by apartment
        List<Apartment> apartments = apartmentRepository.findAll();
        sb.append("Community-wise breakdown (usage / revenue per apartment):\n");
        for (Apartment apt : apartments) {
            List<Bill> aptBills = allBills.stream().filter(b -> apt.getId().equals(b.getApartment().getId())).toList();
            double aptUsage = aptBills.stream().mapToDouble(Bill::getUsageUnits).sum();
            double aptRevenue = aptBills.stream().filter(b -> "PAID".equals(b.getStatus())).mapToDouble(Bill::getAmount).sum();
            sb.append("  - ").append(apt.getApartmentName()).append(": ").append(aptUsage)
                    .append(" L total usage, ₹").append(aptRevenue).append(" revenue collected\n");
        }

        List<SupportTicket> allTickets = ticketRepository.findAll();
        long escalated = allTickets.stream().filter(t -> "ESCALATED".equals(t.getStatus())).count();
        sb.append("Total support tickets (system-wide): ").append(allTickets.size()).append(", Escalated: ").append(escalated).append("\n");

        return sb.toString();
    }
}