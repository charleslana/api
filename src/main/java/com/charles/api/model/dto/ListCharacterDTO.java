package com.charles.api.model.dto;

import com.charles.api.model.enums.GenderEnum;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ListCharacterDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String name;
    private String image;
    private Long level;
    private GenderEnum gender;
    private ListAttributeDTO attribute;
}
