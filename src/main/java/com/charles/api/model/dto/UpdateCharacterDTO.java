package com.charles.api.model.dto;

import com.charles.api.model.enums.GenderEnum;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class UpdateCharacterDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private GenderEnum gender;
}
