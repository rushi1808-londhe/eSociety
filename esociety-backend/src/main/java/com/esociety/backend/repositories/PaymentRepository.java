package com.esociety.backend.repositories;

import com.esociety.backend.entities.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findBySocietyId(Long societyId);
    List<Payment> findByBillId(Long billId);
    List<Payment> findByResidentId(Long residentId);
}