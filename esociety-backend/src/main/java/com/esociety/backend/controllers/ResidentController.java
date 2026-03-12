package com.esociety.backend.controllers;

import com.esociety.backend.services.ResidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/resident")
@RequiredArgsConstructor
public class ResidentController {

    private final ResidentService residentService;

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

    // Pay Bill
    @PostMapping("/bills/pay")
    public ResponseEntity<?> payBill(@RequestBody Map<String, String> request) {
        return residentService.payBill(
            Long.parseLong(request.get("userId")),
            Long.parseLong(request.get("billId"))
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
}