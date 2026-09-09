package com.waterbilling1.water_billing_system.service;

import com.waterbilling1.water_billing_system.dto.PayBillRequest;
import com.waterbilling1.water_billing_system.dto.PaymentResponse;
import com.waterbilling1.water_billing_system.dto.CreateOrderRequest;
import com.waterbilling1.water_billing_system.dto.CreateOrderResponse;
import com.waterbilling1.water_billing_system.dto.VerifyPaymentRequest;

import java.util.List;

public interface PaymentService {
    PaymentResponse payBill(Long householdUserId, PayBillRequest request);
    List<PaymentResponse> getPaymentHistory(Long householdUserId);
    PaymentResponse getPaymentForBill(Long householdUserId, Long billId);

    CreateOrderResponse createRazorpayOrder(Long householdUserId, CreateOrderRequest request);
    PaymentResponse verifyAndCompletePayment(Long householdUserId, VerifyPaymentRequest request);
}