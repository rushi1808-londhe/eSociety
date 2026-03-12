package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "residents")
public class Resident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long residentId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false, unique = true)
    private Long flatId;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String moveInDate;
}