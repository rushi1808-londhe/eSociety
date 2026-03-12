package com.esociety.backend.entities;

import com.esociety.backend.enums.FlatType;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "maintenance_rates")
public class MaintenanceRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rateId;

    @Column(nullable = false)
    private Long societyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FlatType flatType;

    @Column(nullable = false)
    private Double flatCharge;

    @Column(nullable = false)
    private Double twoWheelerCharge;

    @Column(nullable = false)
    private Double fourWheelerCharge;
}