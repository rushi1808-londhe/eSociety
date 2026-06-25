package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long expenseId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private String category;

    private String description;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String expenseDate;

    @Column(nullable = false)
    private Long recordedByAdminId;
}
