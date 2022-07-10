package com.charles.api.model.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "attribute")
public class Attribute implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @SequenceGenerator(name = "attribute_sequence", sequenceName = "attribute_sequence", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "attribute_sequence")
    @Column(name = "id")
    private Long id;

    @Column(name = "strength", nullable = false)
    private Long strength;

    @Column(name = "defense", nullable = false)
    private Long defense;

    @Column(name = "life", nullable = false)
    private Long life;

    @Column(name = "energy", nullable = false)
    private Long energy;

    @Column(name = "agility", nullable = false)
    private Long agility;

    @Column(name = "resistance", nullable = false)
    private Long resistance;

    @Column(name = "intelligence", nullable = false)
    private Long intelligence;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
