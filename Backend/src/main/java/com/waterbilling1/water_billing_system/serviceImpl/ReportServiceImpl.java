package com.waterbilling1.water_billing_system.serviceImpl;

import com.lowagie.text.Document;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.waterbilling1.water_billing_system.dto.ResidentUsageReportResponse;
import com.waterbilling1.water_billing_system.dto.ResidentUsageReportRow;
import com.waterbilling1.water_billing_system.entity.ApartmentAdmin;
import com.waterbilling1.water_billing_system.entity.Bill;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.ApartmentAdminRepository;
import com.waterbilling1.water_billing_system.repository.BillRepository;
import com.waterbilling1.water_billing_system.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.WaterPurchaseRepository;
import com.waterbilling1.water_billing_system.repository.SupportTicketRepository;
import com.waterbilling1.water_billing_system.repository.AnnouncementRepository;
import com.waterbilling1.water_billing_system.entity.Announcement;
import com.waterbilling1.water_billing_system.entity.WaterPurchase;
import com.waterbilling1.water_billing_system.dto.BillingSummaryReportResponse;
import com.waterbilling1.water_billing_system.dto.CommunityAnalyticsReportResponse;
import com.waterbilling1.water_billing_system.dto.CyclePaymentTrend;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ApartmentAdminRepository apartmentAdminRepository;
    private final BillRepository billRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;
    private final SupportTicketRepository ticketRepository;
    private final AnnouncementRepository announcementRepository;

    @Override
    public ResidentUsageReportResponse getResidentUsageComparisonReport(Long apartmentAdminUserId, String billingCycle) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<Bill> allBills = billRepository.findByApartment_IdOrderByGeneratedDateDesc(admin.getApartment().getId());

        String cycle = (billingCycle != null && !billingCycle.isBlank())
                ? billingCycle
                : allBills.stream().findFirst().map(Bill::getBillingCycle).orElse(null);

        List<Bill> cycleBills = allBills.stream()
                .filter(b -> cycle != null && cycle.equals(b.getBillingCycle()))
                .toList();

        double totalUsage = cycleBills.stream().mapToDouble(Bill::getUsageUnits).sum();
        double averageUsage = cycleBills.isEmpty() ? 0.0 : totalUsage / cycleBills.size();
        double maxUsage = cycleBills.stream().mapToDouble(Bill::getUsageUnits).max().orElse(0.0);
        double minUsage = cycleBills.stream().mapToDouble(Bill::getUsageUnits).min().orElse(0.0);

        List<ResidentUsageReportRow> rows = cycleBills.stream()
                .sorted(Comparator.comparingDouble(Bill::getUsageUnits).reversed())
                .map(b -> ResidentUsageReportRow.builder()
                        .householdName(b.getHouseholdUser().getFullName())
                        .flatNumber(b.getHouseholdUser().getFlatNumber())
                        .totalUsage(b.getUsageUnits())
                        .totalBilled(b.getAmount())
                        .rank(classify(b.getUsageUnits(), maxUsage, minUsage, averageUsage))
                        .build())
                .collect(Collectors.toList());

        return ResidentUsageReportResponse.builder()
                .apartmentName(admin.getApartment().getApartmentName())
                .billingCycle(cycle)
                .generatedAt(LocalDateTime.now())
                .totalUsage(totalUsage)
                .averageUsage(Math.round(averageUsage * 100.0) / 100.0)
                .rows(rows)
                .build();
    }

    private String classify(double usage, double max, double min, double avg) {
        if (usage == max) return "Highest";
        if (usage == min) return "Lowest";
        if (usage > avg) return "Above Average";
        return "Normal";
    }

    @Override
    public BillingSummaryReportResponse getBillingSummaryReport(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));

        List<Bill> bills = billRepository.findByApartment_IdOrderByGeneratedDateDesc(admin.getApartment().getId());

        List<Bill> paid = bills.stream().filter(b -> "PAID".equals(b.getStatus())).toList();
        List<Bill> unpaid = bills.stream().filter(b -> !"PAID".equals(b.getStatus())).toList();
        List<Bill> overdue = bills.stream().filter(b -> "OVERDUE".equals(b.getStatus())).toList();

        double totalBilled = bills.stream().mapToDouble(Bill::getAmount).sum();
        double totalCollected = paid.stream().mapToDouble(Bill::getAmount).sum();

        Map<String, List<Bill>> byCycle = bills.stream().collect(Collectors.groupingBy(Bill::getBillingCycle));
        List<CyclePaymentTrend> trends = byCycle.entrySet().stream()
                .map(e -> CyclePaymentTrend.builder()
                        .billingCycle(e.getKey())
                        .totalBilled(e.getValue().stream().mapToDouble(Bill::getAmount).sum())
                        .totalCollected(e.getValue().stream().filter(b -> "PAID".equals(b.getStatus())).mapToDouble(Bill::getAmount).sum())
                        .billCount(e.getValue().size())
                        .build())
                .sorted(Comparator.comparing(CyclePaymentTrend::getBillingCycle))
                .collect(Collectors.toList());

        return BillingSummaryReportResponse.builder()
                .apartmentName(admin.getApartment().getApartmentName())
                .generatedAt(LocalDateTime.now())
                .totalBills(bills.size())
                .paidBills(paid.size())
                .unpaidBills(unpaid.size())
                .overdueBills(overdue.size())
                .totalBilledAmount(totalBilled)
                .totalCollected(totalCollected)
                .totalOutstanding(totalBilled - totalCollected)
                .cycleTrends(trends)
                .build();
    }

    @Override
    public byte[] generateBillingSummaryPdf(Long apartmentAdminUserId) {
        BillingSummaryReportResponse r = getBillingSummaryReport(apartmentAdminUserId);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(37, 99, 235));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Billing Summary Report", titleFont));
            Paragraph sub = new Paragraph(r.getApartmentName() + "  |  Generated: " +
                    r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")), subFont);
            sub.setSpacingAfter(18);
            document.add(sub);

            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(100);
            summary.setSpacingAfter(20);
            addSummaryRow(summary, "Total Bills", String.valueOf(r.getTotalBills()), headerFont, normalFont);
            addSummaryRow(summary, "Paid Bills", String.valueOf(r.getPaidBills()), headerFont, normalFont);
            addSummaryRow(summary, "Unpaid Bills", String.valueOf(r.getUnpaidBills()), headerFont, normalFont);
            addSummaryRow(summary, "Overdue Bills", String.valueOf(r.getOverdueBills()), headerFont, normalFont);
            addSummaryRow(summary, "Total Billed Amount", "₹" + r.getTotalBilledAmount(), headerFont, normalFont);
            addSummaryRow(summary, "Total Collected (Revenue)", "₹" + r.getTotalCollected(), headerFont, normalFont);
            addSummaryRow(summary, "Total Outstanding", "₹" + r.getTotalOutstanding(), headerFont, normalFont);
            document.add(summary);

            document.add(new Paragraph("Payment Trend by Billing Cycle", headerFont));
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            for (String h : new String[]{"Cycle", "Bills", "Billed (₹)", "Collected (₹)"}) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, headerFont));
                cell.setBackgroundColor(new Color(243, 244, 246));
                cell.setPadding(8);
                table.addCell(cell);
            }
            for (CyclePaymentTrend t : r.getCycleTrends()) {
                table.addCell(cellOf(t.getBillingCycle(), normalFont));
                table.addCell(cellOf(String.valueOf(t.getBillCount()), normalFont));
                table.addCell(cellOf(String.format("%.2f", t.getTotalBilled()), normalFont));
                table.addCell(cellOf(String.format("%.2f", t.getTotalCollected()), normalFont));
            }
            document.add(table);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate billing summary PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report.");
        }
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, labelFont));
        labelCell.setPadding(6);
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, valueFont));
        valueCell.setPadding(6);
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(valueCell);
    }

    @Override
    public byte[] generateBillingSummaryExcel(Long apartmentAdminUserId) {
        BillingSummaryReportResponse r = getBillingSummaryReport(apartmentAdminUserId);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Billing Summary");
            CellStyle titleStyle = boldStyle(workbook, 14);
            CellStyle headerStyle = headerStyle(workbook);

            int i = 0;
            Row title = sheet.createRow(i++);
            title.createCell(0).setCellValue("Billing Summary Report");
            title.getCell(0).setCellStyle(titleStyle);

            Row meta = sheet.createRow(i++);
            meta.createCell(0).setCellValue(r.getApartmentName());
            meta.createCell(1).setCellValue("Generated: " + r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
            i++;

            String[][] summaryRows = {
                    {"Total Bills", String.valueOf(r.getTotalBills())},
                    {"Paid Bills", String.valueOf(r.getPaidBills())},
                    {"Unpaid Bills", String.valueOf(r.getUnpaidBills())},
                    {"Overdue Bills", String.valueOf(r.getOverdueBills())},
                    {"Total Billed Amount (₹)", String.valueOf(r.getTotalBilledAmount())},
                    {"Total Collected (₹)", String.valueOf(r.getTotalCollected())},
                    {"Total Outstanding (₹)", String.valueOf(r.getTotalOutstanding())},
            };
            for (String[] row : summaryRows) {
                Row rr = sheet.createRow(i++);
                rr.createCell(0).setCellValue(row[0]);
                rr.createCell(1).setCellValue(row[1]);
            }
            i++;

            Row header = sheet.createRow(i++);
            String[] headers = {"Billing Cycle", "Bills", "Billed (₹)", "Collected (₹)"};
            for (int c = 0; c < headers.length; c++) {
                Cell cell = header.createCell(c);
                cell.setCellValue(headers[c]);
                cell.setCellStyle(headerStyle);
            }
            for (CyclePaymentTrend t : r.getCycleTrends()) {
                Row row = sheet.createRow(i++);
                row.createCell(0).setCellValue(t.getBillingCycle());
                row.createCell(1).setCellValue(t.getBillCount());
                row.createCell(2).setCellValue(t.getTotalBilled());
                row.createCell(3).setCellValue(t.getTotalCollected());
            }

            for (int c = 0; c < 4; c++) sheet.autoSizeColumn(c);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate billing summary Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report.");
        }
    }

    @Override
    public CommunityAnalyticsReportResponse getCommunityAnalyticsReport(Long apartmentAdminUserId) {
        ApartmentAdmin admin = apartmentAdminRepository.findById(apartmentAdminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment Admin not found."));
        Long apartmentId = admin.getApartment().getId();

        int totalResidents = householdUserRepository.findByApartment_IdAndStatus(apartmentId, "ACTIVE").size();

        List<Bill> bills = billRepository.findByApartment_IdOrderByGeneratedDateDesc(apartmentId);
        double totalConsumption = bills.stream().mapToDouble(Bill::getUsageUnits).sum();
        double avgConsumption = totalResidents > 0 ? totalConsumption / totalResidents : 0;

        List<String> cycles = bills.stream().map(Bill::getBillingCycle).distinct().sorted().collect(Collectors.toList());
        double currentCycleUsage = 0, prevCycleUsage = 0;
        if (!cycles.isEmpty()) {
            String latest = cycles.get(cycles.size() - 1);
            currentCycleUsage = bills.stream().filter(b -> latest.equals(b.getBillingCycle())).mapToDouble(Bill::getUsageUnits).sum();
            if (cycles.size() > 1) {
                String prev = cycles.get(cycles.size() - 2);
                prevCycleUsage = bills.stream().filter(b -> prev.equals(b.getBillingCycle())).mapToDouble(Bill::getUsageUnits).sum();
            }
        }
        double changePercent = prevCycleUsage > 0 ? ((currentCycleUsage - prevCycleUsage) / prevCycleUsage) * 100 : 0;

        List<WaterPurchase> purchases = waterPurchaseRepository.findByApartment_Id(apartmentId);
        double totalPurchasedLiters = purchases.stream().mapToDouble(WaterPurchase::getVolumePurchasedLiters).sum();
        double totalPurchaseCost = purchases.stream().mapToDouble(WaterPurchase::getTotalCost).sum();

        int totalTickets = ticketRepository.findByApartment_IdOrderByCreatedAtDesc(apartmentId).size();
        int totalAnnouncements = announcementRepository.findByApartment_IdOrderByPublishDateDesc(apartmentId).size();

        return CommunityAnalyticsReportResponse.builder()
                .apartmentName(admin.getApartment().getApartmentName())
                .generatedAt(LocalDateTime.now())
                .totalResidents(totalResidents)
                .totalConsumptionAllTime(totalConsumption)
                .averageConsumptionPerHousehold(Math.round(avgConsumption * 100.0) / 100.0)
                .currentCycleConsumption(currentCycleUsage)
                .previousCycleConsumption(prevCycleUsage)
                .consumptionChangePercent(Math.round(changePercent * 100.0) / 100.0)
                .totalWaterPurchasedLiters((int) totalPurchasedLiters)
                .totalWaterPurchaseCost(totalPurchaseCost)
                .totalSupportTickets(totalTickets)
                .totalAnnouncements(totalAnnouncements)
                .build();
    }

    @Override
    public byte[] generateCommunityAnalyticsPdf(Long apartmentAdminUserId) {
        CommunityAnalyticsReportResponse r = getCommunityAnalyticsReport(apartmentAdminUserId);
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(37, 99, 235));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Community Analytics Report", titleFont));
            Paragraph sub = new Paragraph(r.getApartmentName() + "  |  Generated: " +
                    r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")), subFont);
            sub.setSpacingAfter(18);
            document.add(sub);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            String changeLabel = r.getConsumptionChangePercent() >= 0 ? "Growth" : "Decline";
            addSummaryRow(table, "Total Residents", String.valueOf(r.getTotalResidents()), headerFont, normalFont);
            addSummaryRow(table, "Total Consumption (All-Time)", r.getTotalConsumptionAllTime() + " L", headerFont, normalFont);
            addSummaryRow(table, "Average Consumption / Household", r.getAverageConsumptionPerHousehold() + " L", headerFont, normalFont);
            addSummaryRow(table, "Current Cycle Consumption", r.getCurrentCycleConsumption() + " L", headerFont, normalFont);
            addSummaryRow(table, "Previous Cycle Consumption", r.getPreviousCycleConsumption() + " L", headerFont, normalFont);
            addSummaryRow(table, "Consumption " + changeLabel, Math.abs(r.getConsumptionChangePercent()) + "%", headerFont, normalFont);
            addSummaryRow(table, "Total Water Purchased", r.getTotalWaterPurchasedLiters() + " L", headerFont, normalFont);
            addSummaryRow(table, "Total Purchase Cost", "₹" + r.getTotalWaterPurchaseCost(), headerFont, normalFont);
            addSummaryRow(table, "Total Support Tickets", String.valueOf(r.getTotalSupportTickets()), headerFont, normalFont);
            addSummaryRow(table, "Total Announcements Published", String.valueOf(r.getTotalAnnouncements()), headerFont, normalFont);
            document.add(table);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate community analytics PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report.");
        }
    }

    @Override
    public byte[] generateCommunityAnalyticsExcel(Long apartmentAdminUserId) {
        CommunityAnalyticsReportResponse r = getCommunityAnalyticsReport(apartmentAdminUserId);
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Community Analytics");
            CellStyle titleStyle = boldStyle(workbook, 14);

            int i = 0;
            Row title = sheet.createRow(i++);
            title.createCell(0).setCellValue("Community Analytics Report");
            title.getCell(0).setCellStyle(titleStyle);

            Row meta = sheet.createRow(i++);
            meta.createCell(0).setCellValue(r.getApartmentName());
            meta.createCell(1).setCellValue("Generated: " + r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
            i++;

            String changeLabel = r.getConsumptionChangePercent() >= 0 ? "Growth" : "Decline";
            String[][] rows = {
                    {"Total Residents", String.valueOf(r.getTotalResidents())},
                    {"Total Consumption (All-Time, L)", String.valueOf(r.getTotalConsumptionAllTime())},
                    {"Average Consumption / Household (L)", String.valueOf(r.getAverageConsumptionPerHousehold())},
                    {"Current Cycle Consumption (L)", String.valueOf(r.getCurrentCycleConsumption())},
                    {"Previous Cycle Consumption (L)", String.valueOf(r.getPreviousCycleConsumption())},
                    {"Consumption " + changeLabel + " (%)", String.valueOf(Math.abs(r.getConsumptionChangePercent()))},
                    {"Total Water Purchased (L)", String.valueOf(r.getTotalWaterPurchasedLiters())},
                    {"Total Purchase Cost (₹)", String.valueOf(r.getTotalWaterPurchaseCost())},
                    {"Total Support Tickets", String.valueOf(r.getTotalSupportTickets())},
                    {"Total Announcements", String.valueOf(r.getTotalAnnouncements())},
            };
            for (String[] row : rows) {
                Row rr = sheet.createRow(i++);
                rr.createCell(0).setCellValue(row[0]);
                rr.createCell(1).setCellValue(row[1]);
            }

            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate community analytics Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report.");
        }
    }

    private CellStyle boldStyle(Workbook workbook, int size) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) size);
        style.setFont(font);
        return style;
    }

    private CellStyle headerStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    @Override
    public byte[] generateResidentUsagePdf(Long apartmentAdminUserId, String billingCycle) {
        ResidentUsageReportResponse report = getResidentUsageComparisonReport(apartmentAdminUserId, billingCycle);

        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font titleFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(37, 99, 235));
            com.lowagie.text.Font subFont =
                    FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            com.lowagie.text.Font headerFont =
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            com.lowagie.text.Font normalFont =
                    FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Resident-Wise Water Usage Comparison Report", titleFont));
            Paragraph sub = new Paragraph(
                    report.getApartmentName() + "  |  Billing Cycle: " + report.getBillingCycle() +
                            "  |  Generated: " + report.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
                    subFont);
            sub.setSpacingAfter(18);
            document.add(sub);

            Paragraph summary = new Paragraph(
                    "Total Usage: " + report.getTotalUsage() + " L   |   Average Usage: " + report.getAverageUsage() + " L per household",
                    headerFont);
            summary.setSpacingAfter(14);
            document.add(summary);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2.5f, 1.2f, 1.5f, 1.5f, 1.5f});

            for (String h : new String[]{"Resident", "Flat", "Usage (L)", "Bill Amount (₹)", "Category"}) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, headerFont));
                cell.setBackgroundColor(new Color(243, 244, 246));
                cell.setPadding(8);
                table.addCell(cell);
            }

            for (ResidentUsageReportRow row : report.getRows()) {
                table.addCell(cellOf(row.getHouseholdName(), normalFont));
                table.addCell(cellOf(row.getFlatNumber(), normalFont));
                table.addCell(cellOf(String.valueOf(row.getTotalUsage()), normalFont));
                table.addCell(cellOf(String.format("%.2f", row.getTotalBilled()), normalFont));
                table.addCell(cellOf(row.getRank(), normalFont));
            }

            document.add(table);

            Paragraph footer = new Paragraph(" ");
            footer.setSpacingBefore(20);
            document.add(footer);

            com.lowagie.text.Font footerFont =
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);

            document.add(new Paragraph(
                    "Generated by HydroHome Water Monitoring & Billing Platform.",
                    footerFont));

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report.");
        }
    }

    private PdfPCell cellOf(String text, com.lowagie.text.Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(7);
        return cell;
    }


    @Override
    public byte[] generateResidentUsageExcel(Long apartmentAdminUserId, String billingCycle) {
        ResidentUsageReportResponse report = getResidentUsageComparisonReport(apartmentAdminUserId, billingCycle);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Resident Usage Report");

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int rowIdx = 0;

            Row title = sheet.createRow(rowIdx++);
            Cell titleCell = title.createCell(0);
            titleCell.setCellValue("Resident-Wise Water Usage Comparison Report");
            titleCell.setCellStyle(titleStyle);

            Row meta = sheet.createRow(rowIdx++);
            meta.createCell(0).setCellValue(report.getApartmentName());
            meta.createCell(1).setCellValue("Cycle: " + report.getBillingCycle());
            meta.createCell(2).setCellValue("Generated: " + report.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));

            Row summaryRow = sheet.createRow(rowIdx++);
            summaryRow.createCell(0).setCellValue("Total Usage (L): " + report.getTotalUsage());
            summaryRow.createCell(1).setCellValue("Average Usage (L): " + report.getAverageUsage());

            rowIdx++; // blank spacer row

            Row header = sheet.createRow(rowIdx++);
            String[] headers = {"Resident", "Flat", "Usage (L)", "Bill Amount (₹)", "Category"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            for (ResidentUsageReportRow r : report.getRows()) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(r.getHouseholdName());
                row.createCell(1).setCellValue(r.getFlatNumber());
                row.createCell(2).setCellValue(r.getTotalUsage());
                row.createCell(3).setCellValue(r.getTotalBilled());
                row.createCell(4).setCellValue(r.getRank());
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate Excel report: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report.");
        }
    }
}