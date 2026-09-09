package com.waterbilling1.water_billing_system.serviceImpl;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import com.waterbilling1.water_billing_system.dto.CreateOrderRequest;
import com.waterbilling1.water_billing_system.dto.CreateOrderResponse;
import com.waterbilling1.water_billing_system.dto.PayBillRequest;
import com.waterbilling1.water_billing_system.dto.PaymentResponse;
import com.waterbilling1.water_billing_system.dto.VerifyPaymentRequest;
import com.waterbilling1.water_billing_system.entity.Bill;
import com.waterbilling1.water_billing_system.entity.HouseholdUser;
import com.waterbilling1.water_billing_system.entity.Payment;
import com.waterbilling1.water_billing_system.exception.ResourceNotFoundException;
import com.waterbilling1.water_billing_system.repository.BillRepository;
import com.waterbilling1.water_billing_system.repository.HouseholdUserRepository;
import com.waterbilling1.water_billing_system.repository.PaymentRepository;
import com.waterbilling1.water_billing_system.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.waterbilling1.water_billing_system.service.EmailService;
import com.waterbilling1.water_billing_system.service.NotificationService;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final HouseholdUserRepository householdUserRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Override
    @Transactional
    public PaymentResponse payBill(Long householdUserId, PayBillRequest request) {

        HouseholdUser householdUser = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + request.getBillId()));

        if (!bill.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Bill not found for this household user.");
        }

        if (paymentRepository.findByBill_Id(bill.getId()).isPresent()) {
            throw new IllegalStateException("This bill has already been paid.");
        }

        if (!request.getPaymentMethod().equals("ONLINE") && !request.getPaymentMethod().equals("CASH")) {
            throw new IllegalArgumentException("Payment method must be either ONLINE or CASH.");
        }

        Payment payment = Payment.builder()
                .bill(bill)
                .householdUser(householdUser)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus("SUCCESS")
                .amountPaid(bill.getAmount())
                .paymentDate(LocalDateTime.now())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        bill.setStatus("PAID");
        billRepository.save(bill);

        sendInvoiceEmail(bill, savedPayment);

        return toResponse(savedPayment);
    }

    @Override
    @Transactional
    public CreateOrderResponse createRazorpayOrder(Long householdUserId, CreateOrderRequest request) {

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + request.getBillId()));

        if (!bill.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Bill not found for this household user.");
        }

        if (paymentRepository.findByBill_Id(bill.getId()).isPresent()) {
            throw new IllegalStateException("This bill has already been paid.");
        }

        int amountInPaise = (int) Math.round(bill.getAmount() * 100);

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "bill_" + bill.getId());

            Order order = client.orders.create(orderRequest);

            return CreateOrderResponse.builder()
                    .razorpayOrderId(order.get("id"))
                    .amountInPaise(amountInPaise)
                    .currency("INR")
                    .razorpayKeyId(razorpayKeyId)
                    .billId(bill.getId())
                    .billNumber(bill.getBillNumber())
                    .build();

        } catch (Exception e) {
            throw new IllegalStateException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public PaymentResponse verifyAndCompletePayment(Long householdUserId, VerifyPaymentRequest request) {

        HouseholdUser householdUser = householdUserRepository.findById(householdUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Household user not found."));

        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + request.getBillId()));

        if (!bill.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Bill not found for this household user.");
        }

        if (paymentRepository.findByBill_Id(bill.getId()).isPresent()) {
            throw new IllegalStateException("This bill has already been paid.");
        }

        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", request.getRazorpayOrderId());
        options.put("razorpay_payment_id", request.getRazorpayPaymentId());
        options.put("razorpay_signature", request.getRazorpaySignature());

        boolean isValid;
        try {
            isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);
        } catch (Exception e) {
            throw new IllegalStateException("Signature verification failed: " + e.getMessage());
        }

        if (!isValid) {
            throw new IllegalStateException("Payment verification failed. This payment could not be confirmed as genuine.");
        }

        Payment payment = Payment.builder()
                .bill(bill)
                .householdUser(householdUser)
                .paymentMethod("ONLINE")
                .paymentStatus("SUCCESS")
                .amountPaid(bill.getAmount())
                .paymentDate(LocalDateTime.now())
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        bill.setStatus("PAID");
        billRepository.save(bill);

        sendInvoiceEmail(bill, savedPayment);

        return toResponse(savedPayment);
    }

    @Override
    public List<PaymentResponse> getPaymentHistory(Long householdUserId) {
        return paymentRepository.findByHouseholdUser_IdOrderByPaymentDateDesc(householdUserId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public PaymentResponse getPaymentForBill(Long householdUserId, Long billId) {
        Payment payment = paymentRepository.findByBill_Id(billId)
                .orElseThrow(() -> new ResourceNotFoundException("No payment found for this bill."));

        if (!payment.getHouseholdUser().getId().equals(householdUserId)) {
            throw new ResourceNotFoundException("Payment not found for this household user.");
        }

        return toResponse(payment);
    }

    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .billId(p.getBill().getId())
                .billNumber(p.getBill().getBillNumber())
                .paymentMethod(p.getPaymentMethod())
                .paymentStatus(p.getPaymentStatus())
                .amountPaid(p.getAmountPaid())
                .paymentDate(p.getPaymentDate())
                .build();
    }

    private void sendInvoiceEmail(Bill bill, Payment payment) {
        HouseholdUser household = bill.getHouseholdUser();
        emailService.sendPaymentConfirmationEmail(
                household.getEmail(),
                household.getFullName(),
                bill.getBillNumber(),
                bill.getBillingCycle(),
                bill.getUsageUnits(),
                bill.getTier1Usage(), bill.getTier1Rate(), bill.getTier1Amount(),
                bill.getTier2Usage(), bill.getTier2Rate(), bill.getTier2Amount(),
                bill.getExtraChargeAmount(),
                bill.getAmount(),
                payment.getPaymentMethod(),
                payment.getRazorpayPaymentId(),
                payment.getPaymentDate()
        );

        notificationService.notify(household, "Payment Successful",
                String.format("Your payment of ₹%.2f has been received successfully.\nYour invoice has been sent to your registered email.", bill.getAmount()),
                "SUCCESS");
    }
}