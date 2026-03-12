package com.esociety.backend.entities;

import com.esociety.backend.enums.FlatType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "flats")
public class Flat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long flatId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private Long buildingId;

    @Column(nullable = false)
    private String flatNumber;

    @Column(nullable = false)
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlatType flatType;

    @Column(nullable = false)
    private Boolean isVacant = true;
}