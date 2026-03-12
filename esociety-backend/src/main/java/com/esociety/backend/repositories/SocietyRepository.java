package com.esociety.backend.repositories;

import com.esociety.backend.entities.Society;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocietyRepository extends JpaRepository<Society, Long> {
    boolean existsByName(String name);
}