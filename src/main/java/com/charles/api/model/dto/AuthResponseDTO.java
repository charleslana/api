package com.charles.api.model.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter

@AllArgsConstructor
public class AuthResponseDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String accessToken;
    private String email;
}
