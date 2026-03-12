package com.esociety.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "notices")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noticeId;

    @Column(nullable = false)
    private Long societyId;

    @Column(nullable = false)
    private Long adminId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String postedAt;

    @Column(nullable = false)
    private Boolean isActive = true;
}