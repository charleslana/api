package com.charles.api.model.entity;

import com.charles.api.model.enums.BannedEnum;
import com.charles.api.model.enums.GenderEnum;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "character")
public class Character implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @SequenceGenerator(name = "character_sequence", sequenceName = "character_sequence", allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "character_sequence")
    @Column(name = "id")
    private Long id;

    @Column(name = "name", length = 20, unique = true, nullable = false)
    private String name;

    @Column(name = "image", nullable = false)
    private String image;

    @Column(name = "gender", nullable = false)
    @Enumerated(EnumType.STRING)
    private GenderEnum gender;

    @Column(name = "banned", nullable = false)
    @Enumerated(EnumType.STRING)
    private BannedEnum banned;

    @Column(name = "level", nullable = false)
    private Long level;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @OneToOne(cascade= CascadeType.ALL)
    @JoinColumn(name = "attribute_id")
    private Attribute attribute;
}
