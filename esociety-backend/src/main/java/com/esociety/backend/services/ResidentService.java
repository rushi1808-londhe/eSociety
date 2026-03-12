package com.esociety.backend.services;

import com.esociety.backend.entities.*;
import com.esociety.backend.enums.BillStatus;
import com.esociety.backend.enums.ComplaintStatus;
import com.esociety.backend.repositories.*;
import com.esociety.backend.response.UniversalResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ResidentService {

    private final ResidentRepository residentRepository;
    private final FlatRepository flatRepository;
    private final MaintenanceBillRepository maintenanceBillRepository;
    private final PaymentRepository paymentRepository;
    private final ComplaintRepository complaintRepository;
    private final NoticeRepository noticeRepository;
    private final UniversalResponse universalResponse;

    // ===== DASHBOARD =====
    public ResponseEntity<?> getDashboardStats(Long userId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            List<MaintenanceBill> bills = maintenanceBillRepository.findByFlatId(resident.getFlatId());
            long totalBills = bills.size();
            long unpaidBills = bills.stream().filter(b -> b.getStatus() == BillStatus.UNPAID).count();
            long paidBills = bills.stream().filter(b -> b.getStatus() == BillStatus.PAID).count();
            long totalComplaints = complaintRepository.findByResidentId(resident.getResidentId()).size();

            Optional<Flat> flat = flatRepository.findById(resident.getFlatId());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBills", totalBills);
            stats.put("unpaidBills", unpaidBills);
            stats.put("paidBills", paidBills);
            stats.put("totalComplaints", totalComplaints);
            flat.ifPresent(f -> {
                stats.put("flatNumber", f.getFlatNumber());
                stats.put("flatType", f.getFlatType());
            });
            stats.put("moveInDate", resident.getMoveInDate());
            stats.put("phone", resident.getPhone());

            return universalResponse.send("Stats fetched successfully", stats, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MY BILLS =====
    public ResponseEntity<?> getMyBills(Long userId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            List<MaintenanceBill> bills = maintenanceBillRepository.findByFlatId(resident.getFlatId());
            return universalResponse.send("Bills fetched successfully", bills, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MY PAYMENTS =====
    public ResponseEntity<?> getMyPayments(Long userId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            List<Payment> payments = paymentRepository.findByResidentId(resident.getResidentId());
            return universalResponse.send("Payments fetched successfully", payments, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Pay Bill
    public ResponseEntity<?> payBill(Long userId, Long billId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            MaintenanceBill bill = maintenanceBillRepository.findById(billId)
                    .orElseThrow(() -> new RuntimeException("Bill not found"));

            if (bill.getStatus() == BillStatus.PAID) {
                return universalResponse.send("Bill is already paid", null, HttpStatus.CONFLICT);
            }

            // Create payment
            Payment payment = new Payment();
            payment.setSocietyId(resident.getSocietyId());
            payment.setBillId(billId);
            payment.setResidentId(resident.getResidentId());
            payment.setAmountPaid(bill.getTotalAmount());
            payment.setPaymentDate(LocalDate.now().toString());
            payment.setStatus(com.esociety.backend.enums.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // Update bill status
            bill.setStatus(BillStatus.PAID);
            maintenanceBillRepository.save(bill);

            return universalResponse.send("Payment successful", true, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MY COMPLAINTS =====
    public ResponseEntity<?> getMyComplaints(Long userId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            List<Complaint> complaints = complaintRepository.findByResidentId(resident.getResidentId());
            return universalResponse.send("Complaints fetched successfully", complaints, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<?> addComplaint(Long userId, String title, String description) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            Complaint complaint = new Complaint();
            complaint.setSocietyId(resident.getSocietyId());
            complaint.setResidentId(resident.getResidentId());
            complaint.setFlatId(resident.getFlatId());
            complaint.setTitle(title);
            complaint.setDescription(description);
            complaint.setStatus(ComplaintStatus.OPEN);
            complaint.setCreatedAt(LocalDate.now().toString());
            complaintRepository.save(complaint);

            return universalResponse.send("Complaint submitted successfully", null, HttpStatus.CREATED);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ===== MY NOTICES =====
    public ResponseEntity<?> getMyNotices(Long userId) {
        try {
            Resident resident = residentRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Resident not found"));

            List<Notice> notices = noticeRepository.findBySocietyIdAndIsActiveTrue(resident.getSocietyId());
            return universalResponse.send("Notices fetched successfully", notices, HttpStatus.OK);
        } catch (Exception e) {
            return universalResponse.send("Something went wrong: " + e.getMessage(), null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}