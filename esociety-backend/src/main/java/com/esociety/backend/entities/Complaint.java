package com.esociety.backend.entities;

import com.esociety.backend.enums.ComplaintStatus;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long complaintId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private Long residentId;

    @Column(nullable = false)
    private Long flatId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status = ComplaintStatus.OPEN;

    @Column(nullable = false)
    private String createdAt;
}