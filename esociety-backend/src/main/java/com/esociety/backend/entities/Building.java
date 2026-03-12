package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "buildings")
public class Building {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long buildingId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer totalFloors;

    @Column(nullable = false)
    private Boolean isActive = true;
}