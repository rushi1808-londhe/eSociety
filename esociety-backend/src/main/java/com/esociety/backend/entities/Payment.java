package com.esociety.backend.entities;

import com.esociety.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private Long billId;

    @Column(nullable = false)
    private Long residentId;

    @Column(nullable = false)
    private Double amountPaid;

    @Column(nullable = false)
    private String paymentDate;

    private String gatewayTxnId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
}