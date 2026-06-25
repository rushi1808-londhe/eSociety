package com.esociety.backend.services;

import com.esociety.backend.entities.LateFeeRule;
import com.esociety.backend.entities.MaintenanceBill;
import com.esociety.backend.enums.BillStatus;
import com.esociety.backend.repositories.LateFeeRuleRepository;
import com.esociety.backend.repositories.MaintenanceBillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LateFeeService {

    private final LateFeeRuleRepository lateFeeRuleRepository;
    private final MaintenanceBillRepository maintenanceBillRepository;

    /**
     * Applies the society's flat late fee to any UNPAID bill whose due date has
     * passed and that hasn't already had a late fee applied. Mutates and persists
     * the bills in place. Safe to call on every read (idempotent).
     */
    public void applyLateFees(List<MaintenanceBill> bills, Long societyId) {
        Optional<LateFeeRule> ruleOpt = lateFeeRuleRepository.findBySocietyId(societyId);
        if (ruleOpt.isEmpty() || !ruleOpt.get().getIsActive()) return;

        double flatLateFee = ruleOpt.get().getFlatAmount();
        LocalDate today = LocalDate.now();

        for (MaintenanceBill bill : bills) {
            if (bill.getStatus() != BillStatus.UNPAID) continue;
            if (bill.getLateFee() != null && bill.getLateFee() > 0) continue;
            if (bill.getDueDate() == null) continue;

            try {
                LocalDate due = LocalDate.parse(bill.getDueDate());
                if (today.isAfter(due)) {
                    bill.setLateFee(flatLateFee);
                    bill.setTotalAmount(bill.getTotalAmount() + flatLateFee);
                    maintenanceBillRepository.save(bill);
                }
            } catch (Exception ignored) {
                // Skip bills with an unparseable dueDate rather than failing the whole batch
            }
        }
    }
}
