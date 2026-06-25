package com.esociety.backend.controllers;

import com.esociety.backend.entities.Payment;
import com.esociety.backend.services.PdfService;
import com.esociety.backend.services.ResidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/resident")
@RequiredArgsConstructor
public class ResidentController {

    private final ResidentService residentService;
    private final PdfService pdfService;

    // Dashboard
    @GetMapping("/dashboard/{userId}")
    public ResponseEntity<?> getDashboardStats(@PathVariable Long userId) {
        return residentService.getDashboardStats(userId);
    }

    // Bills
    @GetMapping("/bills/{userId}")
    public ResponseEntity<?> getMyBills(@PathVariable Long userId) {
        return residentService.getMyBills(userId);
    }

    // Payments
    @GetMapping("/payments/{userId}")
    public ResponseEntity<?> getMyPayments(@PathVariable Long userId) {
        return residentService.getMyPayments(userId);
    }

    // Pay Bill (Step 1: create Razorpay order)
    @PostMapping("/bills/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        return residentService.createOrder(
            Long.parseLong(request.get("userId").toString()),
            Long.parseLong(request.get("billId").toString())
        );
    }

    // Pay Bill (Step 2: verify Razorpay signature and mark paid)
    @PostMapping("/bills/verify-payment")
    public ResponseEntity<?> verifyAndPay(@RequestBody Map<String, Object> request) {
        return residentService.verifyAndPay(
            Long.parseLong(request.get("userId").toString()),
            Long.parseLong(request.get("billId").toString()),
            (String) request.get("razorpayOrderId"),
            (String) request.get("razorpayPaymentId"),
            (String) request.get("razorpaySignature")
        );
    }

    // Complaints
    @GetMapping("/complaints/{userId}")
    public ResponseEntity<?> getMyComplaints(@PathVariable Long userId) {
        return residentService.getMyComplaints(userId);
    }

    @PostMapping("/complaints/add")
    public ResponseEntity<?> addComplaint(@RequestBody Map<String, String> request) {
        return residentService.addComplaint(
            Long.parseLong(request.get("userId")),
            request.get("title"),
            request.get("description")
        );
    }

    // Notices
    @GetMapping("/notices/{userId}")
    public ResponseEntity<?> getMyNotices(@PathVariable Long userId) {
        return residentService.getMyNotices(userId);
    }

    // Payment Receipt (PDF)
    @GetMapping("/payments/{userId}/receipt/{paymentId}")
    public ResponseEntity<?> downloadReceipt(@PathVariable Long userId, @PathVariable Long paymentId) {
        try {
            Payment payment = residentService.getOwnedPayment(userId, paymentId);
            byte[] pdfBytes = pdfService.generateReceipt(payment.getPaymentId());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "receipt-" + paymentId + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}