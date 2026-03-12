package com.esociety.backend.repositories;

import com.esociety.backend.entities.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findBySocietyId(Long societyId);
    List<Complaint> findByResidentId(Long residentId);
}