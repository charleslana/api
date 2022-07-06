package com.charles.api.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ListAttributeDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long strength;
    private Long defense;
    private Long life;
    private Long energy;
    private Long agility;
    private Long resistance;
    private Long intelligence;
}
