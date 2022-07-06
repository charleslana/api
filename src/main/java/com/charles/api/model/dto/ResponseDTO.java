package com.charles.api.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ResponseDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String message;
    private String status;
    private Long timestamp;
}
