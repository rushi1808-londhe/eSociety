package com.esociety.backend.repositories;

import com.esociety.backend.entities.MaintenanceBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceBillRepository extends JpaRepository<MaintenanceBill, Long> {
    List<MaintenanceBill> findBySocietyId(Long societyId);
    List<MaintenanceBill> findByFlatId(Long flatId);
    Optional<MaintenanceBill> findByFlatIdAndBillMonthAndBillYear(Long flatId, Integer billMonth, Integer billYear);
}