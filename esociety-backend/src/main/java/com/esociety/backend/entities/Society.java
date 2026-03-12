package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "societies")
public class Society {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long societyId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private Boolean isActive = true;
}