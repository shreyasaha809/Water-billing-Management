package com.waterbilling1.water_billing_system.serviceImpl;

import com.waterbilling1.water_billing_system.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import java.time.LocalDateTime;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendHouseholdCredentialsEmail(String toEmail, String rawPassword, String loginLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your Household Account Credentials");
            message.setText(
                    "Hello,\n\n" +
                            "Your Household account has been created successfully.\n\n" +
                            "Username (Email): " + toEmail + "\n" +
                            "Password: " + rawPassword + "\n\n" +
                            "You can now log in using these credentials, or use the direct login link below:\n" +
                            loginLink + "\n\n" +
                            "Thank you."
            );

            mailSender.send(message);
            log.info("Household credentials email sent successfully to: {}", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send household credentials email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Override
    public void sendAlertEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Alert email sent to: {}", toEmail);
        } catch (Exception ex) {
            log.error("Failed to send alert email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Override
    public void sendTariffThresholdEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);

            log.info("Tariff threshold email sent successfully to: {}", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send tariff threshold email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Override
    public void sendBillGeneratedEmail(String toEmail, String householdName, String billNumber, String billingCycle,
                                       Double previousReading, Double currentReading, Double usageUnits,
                                       Double sharedAreaCharge, Double householdCharge, Double totalAmount,
                                       LocalDateTime dueDate) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
            boolean hasSharedCharge = sharedAreaCharge != null && sharedAreaCharge > 0;

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(householdName).append(",\n\n")
                    .append("We hope you are doing well.\n\n")
                    .append("This is to inform you that your water bill for the billing cycle ")
                    .append(billingCycle).append(" has been successfully generated and is now available for review.\n")
                    .append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                    .append("             BILL SUMMARY\n")
                    .append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                    .append(String.format("Bill Number             : %s%n", billNumber))
                    .append(String.format("Billing Cycle           : %s%n", billingCycle))
                    .append(String.format("Previous Reading        : %.1f L%n", previousReading))
                    .append(String.format("Current Reading         : %.1f L%n", currentReading))
                    .append(String.format("Household Water Usage   : %.1f L%n", usageUnits));

            if (hasSharedCharge) {
                body.append("Shared Area Allocation  : —\n");
            }

            body.append(String.format("Total Billable Usage    : %.1f L%n", usageUnits))
                    .append(String.format("Household Charge        : ₹%.2f%n", householdCharge));

            if (hasSharedCharge) {
                body.append(String.format("Shared Area Charge      : ₹%.2f%n", sharedAreaCharge));
            }

            body.append("------------------------------------------\n")
                    .append(String.format("Total Amount Payable    : ₹%.2f%n", totalAmount))
                    .append(String.format("Due Date                : %s%n", dueDate.format(dateFormatter)))
                    .append("Payment Status          : UNPAID\n")
                    .append("------------------------------------------\n\n")
                    .append("Please log in to the Water Billing Management System to view your complete bill, download your invoice, and complete the payment before the due date to avoid any late payment charges.\n\n")
                    .append("If you have any questions regarding your bill, please contact your Apartment Administrator for assistance.\n\n")
                    .append("Thank you for your prompt attention and continued cooperation.\n\n")
                    .append("Kind regards,\n")
                    .append("Water Billing Management System\n")
                    .append("Apartment Administration");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Water Bill Generated – Billing Cycle: " + billingCycle);
            message.setText(body.toString());

            mailSender.send(message);
            log.info("Bill generated email sent to: {}", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send bill generated email to {}: {}", toEmail, ex.getMessage());
        }
    }

    @Override
    public void sendPaymentConfirmationEmail(String toEmail, String householdName, String billNumber, String billingCycle,
                                             Double usageUnits, Double tier1Usage, Double tier1Rate, Double tier1Amount,
                                             Double tier2Usage, Double tier2Rate, Double tier2Amount,
                                             Double sharedAreaCharge, Double totalAmount,
                                             String paymentMethod, String transactionRef, LocalDateTime paymentDate) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            boolean hasSharedCharge = sharedAreaCharge != null && sharedAreaCharge > 0;

            byte[] pdfBytes = buildInvoicePdf(householdName, billNumber, billingCycle, usageUnits,
                    tier1Usage, tier1Rate, tier1Amount, tier2Usage, tier2Rate, tier2Amount,
                    sharedAreaCharge, totalAmount, paymentMethod, transactionRef, paymentDate);

            StringBuilder body = new StringBuilder();
            body.append("Dear ").append(householdName).append(",\n\n")
                    .append("We are pleased to confirm that your payment towards the water bill for billing cycle ")
                    .append(billingCycle).append(" has been received successfully.\n\n")
                    .append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                    .append("        PAYMENT CONFIRMATION\n")
                    .append("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
                    .append(String.format("Bill Number             : %s%n", billNumber))
                    .append(String.format("Billing Cycle           : %s%n", billingCycle))
                    .append(String.format("Amount Paid             : ₹%.2f%n", totalAmount))
                    .append(String.format("Payment Method          : %s%n", paymentMethod));

            if (transactionRef != null && !transactionRef.isBlank()) {
                body.append(String.format("Transaction Reference   : %s%n", transactionRef));
            }

            body.append(String.format("Payment Date            : %s%n", paymentDate.format(dateFormatter)))
                    .append("Payment Status          : PAID\n")
                    .append("------------------------------------------\n\n")
                    .append("Your official invoice is attached to this email as a PDF for your records.\n\n")
                    .append("Thank you for your prompt payment.\n\n")
                    .append("Kind regards,\n")
                    .append("Water Billing Management System\n")
                    .append("Apartment Administration");

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true);
            helper.setTo(toEmail);
            helper.setSubject("Payment Confirmation & Water Bill Invoice – Billing Cycle: " + billingCycle);
            helper.setText(body.toString());
            helper.addAttachment("Invoice-" + billNumber + ".pdf", new org.springframework.core.io.ByteArrayResource(pdfBytes));

            mailSender.send(mimeMessage);
            log.info("Payment confirmation email with invoice sent to: {}", toEmail);

        } catch (Exception ex) {
            log.error("Failed to send payment confirmation email to {}: {}", toEmail, ex.getMessage());
        }
    }

    private byte[] buildInvoicePdf(String householdName, String billNumber, String billingCycle,
                                   Double usageUnits, Double tier1Usage, Double tier1Rate, Double tier1Amount,
                                   Double tier2Usage, Double tier2Rate, Double tier2Amount,
                                   Double sharedAreaCharge, Double totalAmount,
                                   String paymentMethod, String transactionRef, LocalDateTime paymentDate) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(37, 99, 235));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(37, 99, 235));

            Paragraph title = new Paragraph("HydroHome — INVOICE", titleFont);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph sub = new Paragraph("Water Monitoring & Billing", normalFont);
            sub.setSpacingAfter(16);
            document.add(sub);

            document.add(new Paragraph("Bill Number: " + billNumber, boldFont));
            document.add(new Paragraph("Billed To: " + householdName, normalFont));
            document.add(new Paragraph("Billing Cycle: " + billingCycle, normalFont));
            Paragraph spacer = new Paragraph(" ");
            spacer.setSpacingAfter(10);
            document.add(spacer);

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 1.5f, 1.5f, 1.5f});

            addHeaderCell(table, "Description", headerFont);
            addHeaderCell(table, "Volume", headerFont);
            addHeaderCell(table, "Rate", headerFont);
            addHeaderCell(table, "Amount", headerFont);

            addCell(table, "Tier 1 (up to " + tier1Usage + " L)", normalFont);
            addCell(table, tier1Usage + " L", normalFont);
            addCell(table, "₹" + tier1Rate + "/L", normalFont);
            addCell(table, String.format("₹%.2f", tier1Amount), normalFont);

            if (tier2Usage != null && tier2Usage > 0) {
                addCell(table, "Tier 2 (beyond threshold)", normalFont);
                addCell(table, tier2Usage + " L", normalFont);
                addCell(table, "₹" + tier2Rate + "/L", normalFont);
                addCell(table, String.format("₹%.2f", tier2Amount), normalFont);
            }

            if (sharedAreaCharge != null && sharedAreaCharge > 0) {
                addCell(table, "Shared Area Water Allocation", normalFont);
                addCell(table, "—", normalFont);
                addCell(table, "—", normalFont);
                addCell(table, String.format("₹%.2f", sharedAreaCharge), normalFont);
            }

            document.add(table);

            Paragraph spacer2 = new Paragraph(" ");
            spacer2.setSpacingAfter(14);
            document.add(spacer2);

            Paragraph totalPara = new Paragraph("Total Amount Paid: ₹" + String.format("%.2f", totalAmount), totalFont);
            document.add(totalPara);

            Paragraph spacer3 = new Paragraph(" ");
            spacer3.setSpacingAfter(14);
            document.add(spacer3);

            document.add(new Paragraph("Payment Method: " + paymentMethod, normalFont));
            if (transactionRef != null && !transactionRef.isBlank()) {
                document.add(new Paragraph("Transaction Reference: " + transactionRef, normalFont));
            }
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
            document.add(new Paragraph("Payment Date: " + paymentDate.format(dateFormatter), normalFont));
            document.add(new Paragraph("Payment Status: PAID", boldFont));

            Paragraph footerSpacer = new Paragraph(" ");
            footerSpacer.setSpacingAfter(20);
            document.add(footerSpacer);

            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 9, Color.GRAY);
            document.add(new Paragraph("This is a system-generated invoice from HydroHome Water Monitoring & Billing Platform.", footerFont));

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate invoice PDF: {}", e.getMessage());
            return new byte[0];
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBackgroundColor(new Color(243, 244, 246));
        cell.setPadding(8);
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(8);
        table.addCell(cell);
    }

}

