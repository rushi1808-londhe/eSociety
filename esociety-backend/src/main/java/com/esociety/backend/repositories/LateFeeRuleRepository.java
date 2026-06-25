package com.esociety.backend.repositories;

import com.esociety.backend.entities.LateFeeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LateFeeRuleRepository extends JpaRepository<LateFeeRule, Long> {
    Optional<LateFeeRule> findBySocietyId(Long societyId);
}
