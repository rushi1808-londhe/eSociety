package com.esociety.backend.repositories;

import com.esociety.backend.entities.MaintenanceRate;
import com.esociety.backend.enums.FlatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MaintenanceRateRepository extends JpaRepository<MaintenanceRate, Long> {
    List<MaintenanceRate> findBySocietyId(Long societyId);
    Optional<MaintenanceRate> findBySocietyIdAndFlatType(Long societyId, FlatType flatType);
}