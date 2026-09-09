package com.waterbilling1.water_billing_system.controller;

import com.waterbilling1.water_billing_system.dto.*;
import com.waterbilling1.water_billing_system.security.CustomUserDetails;
import com.waterbilling1.water_billing_system.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/household-user/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<ApiResponse<PaymentResponse>> payBill(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody PayBillRequest request) {

        PaymentResponse response = paymentService.payBill(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment successful. Bill marked as PAID.", response));
    }

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<CreateOrderResponse>> createOrder(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody CreateOrderRequest request) {

        CreateOrderResponse response = paymentService.createRazorpayOrder(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Razorpay order created.", response));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails principal,
            @Valid @RequestBody VerifyPaymentRequest request) {

        PaymentResponse response = paymentService.verifyAndCompletePayment(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment verified successfully. Bill marked as PAID.", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getHistory(
            @AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(ApiResponse.success("Payment history fetched successfully.",
                paymentService.getPaymentHistory(principal.getId())));
    }

    @GetMapping("/bill/{billId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentForBill(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable Long billId) {
        return ResponseEntity.ok(ApiResponse.success("Payment details fetched successfully.",
                paymentService.getPaymentForBill(principal.getId(), billId)));
    }
}