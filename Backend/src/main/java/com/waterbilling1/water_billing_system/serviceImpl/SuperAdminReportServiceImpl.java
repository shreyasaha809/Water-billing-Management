package com.waterbilling1.water_billing_system.serviceImpl;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.waterbilling1.water_billing_system.dto.CommunityComparisonRow;
import com.waterbilling1.water_billing_system.dto.OrganizationReportResponse;
import com.waterbilling1.water_billing_system.entity.Apartment;
import com.waterbilling1.water_billing_system.entity.Bill;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.SupportTicket;
import com.waterbilling1.water_billing_system.repository.*;
import com.waterbilling1.water_billing_system.service.SuperAdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SuperAdminReportServiceImpl implements SuperAdminReportService {

    private final ApartmentRepository apartmentRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final ApartmentAdminRepository apartmentAdminRepository;
    private final BillRepository billRepository;
    private final SupportTicketRepository ticketRepository;

    @Override
    public OrganizationReportResponse getOrganizationReport() {
        List<Apartment> apartments = apartmentRepository.findAll();
        List<Bill> allBills = billRepository.findAll();
        List<SupportTicket> allTickets = ticketRepository.findAll();
        List<HouseholdUser> allHouseholds = householdUserRepository.findAll();

        double totalRevenue = allBills.stream().filter(b -> "PAID".equals(b.getStatus())).mapToDouble(Bill::getAmount).sum();
        double totalBilled = allBills.stream().mapToDouble(Bill::getAmount).sum();
        double totalConsumption = allBills.stream().mapToDouble(Bill::getUsageUnits).sum();
        long escalated = allTickets.stream().filter(t -> "ESCALATED".equals(t.getStatus())).count();

        long activeResidents = allHouseholds.stream().filter(h -> "ACTIVE".equals(h.getStatus())).count();
        long inactiveResidents = allHouseholds.size() - activeResidents;

        long paidBills = allBills.stream().filter(b -> "PAID".equals(b.getStatus())).count();
        long unpaidBills = allBills.size() - paidBills;
        double outstanding = allBills.stream().filter(b -> !"PAID".equals(b.getStatus())).mapToDouble(Bill::getAmount).sum();

        long resolvedTickets = allTickets.stream().filter(t -> "RESOLVED".equals(t.getStatus()) || "CLOSED".equals(t.getStatus())).count();
        long openTickets = allTickets.size() - resolvedTickets;

        List<CommunityComparisonRow> rows = apartments.stream().map(apt -> {
            List<Bill> aptBills = allBills.stream().filter(b -> apt.getId().equals(b.getApartment().getId())).toList();
            int residentCount = householdUserRepository.findByApartment_IdAndStatus(apt.getId(), "ACTIVE").size();
            double usage = aptBills.stream().mapToDouble(Bill::getUsageUnits).sum();
            double revenue = aptBills.stream().filter(b -> "PAID".equals(b.getStatus())).mapToDouble(Bill::getAmount).sum();
            return CommunityComparisonRow.builder()
                    .apartmentName(apt.getApartmentName())
                    .residentCount(residentCount)
                    .totalUsage(usage)
                    .totalRevenue(revenue)
                    .build();
        }).toList();

        return OrganizationReportResponse.builder()
                .generatedAt(LocalDateTime.now())
                .totalCommunities(apartments.size())
                .totalResidents((int) householdUserRepository.count())
                .totalAdmins((int) apartmentAdminRepository.count())
                .totalRevenue(totalRevenue)
                .totalBilledAmount(totalBilled)
                .totalConsumption(totalConsumption)
                .totalSupportTickets(allTickets.size())
                .escalatedTickets((int) escalated)
                .activeResidents((int) activeResidents)
                .inactiveResidents((int) inactiveResidents)
                .paidBills((int) paidBills)
                .unpaidBills((int) unpaidBills)
                .outstandingAmount(outstanding)
                .openTickets((int) openTickets)
                .resolvedTickets((int) resolvedTickets)
                .communities(rows)
                .build();
    }

    @Override
    public byte[] generateOrganizationPdf() {
        OrganizationReportResponse r = getOrganizationReport();
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(37, 99, 235));
            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            document.add(new Paragraph("Organization-Wide Report", titleFont));
            Paragraph sub = new Paragraph("Generated: " + r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")), subFont);
            sub.setSpacingAfter(18);
            document.add(sub);

            PdfPTable summary = new PdfPTable(2);
            summary.setWidthPercentage(100);
            summary.setSpacingAfter(20);
            addRow(summary, "Total Communities", String.valueOf(r.getTotalCommunities()), headerFont, normalFont);
            addRow(summary, "Total Residents", String.valueOf(r.getTotalResidents()), headerFont, normalFont);
            addRow(summary, "Total Apartment Admins", String.valueOf(r.getTotalAdmins()), headerFont, normalFont);
            addRow(summary, "Total Billed Amount", "₹" + r.getTotalBilledAmount(), headerFont, normalFont);
            addRow(summary, "Total Revenue Collected", "₹" + r.getTotalRevenue(), headerFont, normalFont);
            addRow(summary, "Total Water Consumption", r.getTotalConsumption() + " L", headerFont, normalFont);
            addRow(summary, "Total Support Tickets", String.valueOf(r.getTotalSupportTickets()), headerFont, normalFont);
            addRow(summary, "Escalated Tickets", String.valueOf(r.getEscalatedTickets()), headerFont, normalFont);
            document.add(summary);

            document.add(new Paragraph("Community-Wise Comparison", headerFont));
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            for (String h : new String[]{"Community", "Residents", "Usage (L)", "Revenue (₹)"}) {
                PdfPCell cell = new PdfPCell(new Paragraph(h, headerFont));
                cell.setBackgroundColor(new Color(243, 244, 246));
                cell.setPadding(8);
                table.addCell(cell);
            }
            for (CommunityComparisonRow c : r.getCommunities()) {
                table.addCell(cellOf(c.getApartmentName(), normalFont));
                table.addCell(cellOf(String.valueOf(c.getResidentCount()), normalFont));
                table.addCell(cellOf(String.valueOf(c.getTotalUsage()), normalFont));
                table.addCell(cellOf(String.format("%.2f", c.getTotalRevenue()), normalFont));
            }
            document.add(table);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate organization PDF: {}", e.getMessage());
            throw new RuntimeException("Failed to generate PDF report.");
        }
    }

    private void addRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, labelFont));
        labelCell.setPadding(6);
        labelCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, valueFont));
        valueCell.setPadding(6);
        valueCell.setBorder(Rectangle.NO_BORDER);
        table.addCell(valueCell);
    }

    private PdfPCell cellOf(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(7);
        return cell;
    }

    @Override
    public byte[] generateOrganizationExcel() {
        OrganizationReportResponse r = getOrganizationReport();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Organization Report");

            CellStyle titleStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font titleFont =
                    workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 14);
            titleStyle.setFont(titleFont);

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont =
                    workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            int i = 0;
            org.apache.poi.ss.usermodel.Row title = sheet.createRow(i++);

            title.createCell(0).setCellValue("Organization-Wide Report");
            title.getCell(0).setCellStyle(titleStyle);

            org.apache.poi.ss.usermodel.Row meta = sheet.createRow(i++);
            meta.createCell(0).setCellValue("Generated: " + r.getGeneratedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")));
            i++;

            String[][] summaryRows = {
                    {"Total Communities", String.valueOf(r.getTotalCommunities())},
                    {"Total Residents", String.valueOf(r.getTotalResidents())},
                    {"Total Apartment Admins", String.valueOf(r.getTotalAdmins())},
                    {"Total Billed Amount (₹)", String.valueOf(r.getTotalBilledAmount())},
                    {"Total Revenue Collected (₹)", String.valueOf(r.getTotalRevenue())},
                    {"Total Water Consumption (L)", String.valueOf(r.getTotalConsumption())},
                    {"Total Support Tickets", String.valueOf(r.getTotalSupportTickets())},
                    {"Escalated Tickets", String.valueOf(r.getEscalatedTickets())},
            };
            for (String[] row : summaryRows) {
                org.apache.poi.ss.usermodel.Row rr = sheet.createRow(i++);
                rr.createCell(0).setCellValue(row[0]);
                rr.createCell(1).setCellValue(row[1]);
            }
            i++;

            org.apache.poi.ss.usermodel.Row header = sheet.createRow(i++);
            String[] headers = {"Community", "Residents", "Usage (L)", "Revenue (₹)"};
            for (int c = 0; c < headers.length; c++) {
                org.apache.poi.ss.usermodel.Cell cell = header.createCell(c);
                cell.setCellValue(headers[c]);
                cell.setCellStyle(headerStyle);
            }
            for (CommunityComparisonRow c : r.getCommunities()) {
                org.apache.poi.ss.usermodel.Row dataRow = sheet.createRow(i++);
                dataRow.createCell(0).setCellValue(c.getApartmentName());
                dataRow.createCell(1).setCellValue(c.getResidentCount());
                dataRow.createCell(2).setCellValue(c.getTotalUsage());
                dataRow.createCell(3).setCellValue(c.getTotalRevenue());
            }

            for (int c = 0; c < 4; c++) sheet.autoSizeColumn(c);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate organization Excel: {}", e.getMessage());
            throw new RuntimeException("Failed to generate Excel report.");
        }
    }
}