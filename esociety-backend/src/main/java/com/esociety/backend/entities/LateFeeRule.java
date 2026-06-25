package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "late_fee_rules")
public class LateFeeRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lateFeeRuleId;

    @Column(nullable = false, unique = true)
    private Long societyId;

    @Column(nullable = false)
    private Double flatAmount;

    @Column(nullable = false)
    private Boolean isActive = true;
}
