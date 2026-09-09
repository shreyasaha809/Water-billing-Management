package com.waterbilling1.water_billing_system.service;

import java.time.LocalDateTime;

public interface EmailService {
    void sendHouseholdCredentialsEmail(String toEmail, String rawPassword, String loginLink);
    void sendAlertEmail(String toEmail, String subject, String body);
    void sendTariffThresholdEmail(String toEmail, String subject, String body);

    void sendBillGeneratedEmail(String toEmail, String householdName, String billNumber, String billingCycle,
                                Double previousReading, Double currentReading, Double usageUnits,
                                Double sharedAreaCharge, Double householdCharge, Double totalAmount,
                                LocalDateTime dueDate);

    void sendPaymentConfirmationEmail(String toEmail, String householdName, String billNumber, String billingCycle,
                                      Double usageUnits, Double tier1Usage, Double tier1Rate, Double tier1Amount,
                                      Double tier2Usage, Double tier2Rate, Double tier2Amount,
                                      Double sharedAreaCharge, Double totalAmount,
                                      String paymentMethod, String transactionRef, LocalDateTime paymentDate);
}
