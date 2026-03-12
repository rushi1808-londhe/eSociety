package com.esociety.backend.entities;

import com.esociety.backend.enums.ParkingType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "flat_parking")
public class FlatParking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long parkingId;

    @Column(nullable = false)
    private Long flatId;

    @Column(nullable = false)
    private Long societyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingType parkingType;

    @Column(nullable = false)
    private Integer slotsCount;
}