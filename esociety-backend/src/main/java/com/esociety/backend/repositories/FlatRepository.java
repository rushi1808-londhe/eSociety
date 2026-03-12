package com.esociety.backend.repositories;

import com.esociety.backend.entities.Flat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlatRepository extends JpaRepository<Flat, Long> {
    List<Flat> findBySocietyId(Long societyId);
    List<Flat> findByBuildingId(Long buildingId);
    boolean existsByFlatNumberAndBuildingId(String flatNumber, Long buildingId);
}