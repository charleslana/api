package com.charles.api.config.exceptions.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.context.MessageSource;

import java.io.Serial;
import java.io.Serializable;
import java.util.Locale;

@NoArgsConstructor
@Getter
@Setter
public class ApiErrorDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String status;
    private String message;
    private String value;

    public ApiErrorDTO(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public ApiErrorDTO(String status, String message, String[] values, MessageSource ms, Locale locale) {
        this.status = ms.getMessage(status, null, locale);
        this.value = values != null ? String.join(",", values) : "";
        this.message = ms.getMessage(message, this.value.split(","), locale);
    }
    public ApiErrorDTO(String status, String message, String value) {
        this.status = status;
        this.message = message;
        this.value = value;
    }
}
