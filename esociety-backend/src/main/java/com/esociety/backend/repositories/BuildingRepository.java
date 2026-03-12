package com.esociety.backend.repositories;

import com.esociety.backend.entities.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findBySocietyId(Long societyId);
    boolean existsByNameAndSocietyId(String name, Long societyId);
}