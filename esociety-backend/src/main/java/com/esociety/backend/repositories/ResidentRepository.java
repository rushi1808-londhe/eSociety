package com.esociety.backend.repositories;

import com.esociety.backend.entities.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {
    List<Resident> findBySocietyId(Long societyId);
    Optional<Resident> findByFlatId(Long flatId);
    Optional<Resident> findByUserId(Long userId);
}