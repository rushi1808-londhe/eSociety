package com.esociety.backend.entities;

import com.esociety.backend.enums.BillStatus;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "maintenance_bills")
public class MaintenanceBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private Long flatId;

    @Column(nullable = false)
    private Integer billMonth;

    @Column(nullable = false)
    private Integer billYear;

    @Column(nullable = false)
    private Double flatCharge;

    @Column(nullable = false)
    private Double parkingCharge;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String dueDate;

    @Column(nullable = false)
    private Double lateFee = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.UNPAID;
}