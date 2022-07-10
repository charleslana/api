package com.charles.api.model.dto;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class UpdateCharacterNameDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    @NotBlank
    @Size(min = 3, max = 20)
    @Pattern(regexp = "^[a-zA-Z0-9]([_](?![_])|[a-zA-Z0-9]){1,18}[a-zA-Z0-9]$", message = "O nome pode conter letras, números e caractere underscore separando a cada letra, o primeiro e último caractere deve ser alfanuméricos")
    private String name;
}
