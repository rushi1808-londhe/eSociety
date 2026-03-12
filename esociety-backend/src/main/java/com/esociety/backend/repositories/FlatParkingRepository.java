package com.esociety.backend.repositories;

import com.esociety.backend.entities.FlatParking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FlatParkingRepository extends JpaRepository<FlatParking, Long> {
    List<FlatParking> findByFlatId(Long flatId);
    void deleteByFlatId(Long flatId);
}