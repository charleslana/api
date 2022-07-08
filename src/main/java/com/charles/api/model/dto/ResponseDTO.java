package com.charles.api.model.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.io.Serial;
import java.io.Serializable;
import java.util.ResourceBundle;

@Getter
@Setter
@Component
@NoArgsConstructor
public class ResponseDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String property;
    private String message;

    public ResponseDTO(String key, String value) {
        this.property = getKey(key);
        this.message = getMessage(value);
    }

    private String getKey(String key) {
        return ResourceBundle.getBundle("message/message_default", LocaleContextHolder.getLocale()).getString(key);
    }

    private String getMessage(String value) {
        return ResourceBundle.getBundle("message/message_success", LocaleContextHolder.getLocale()).getString(value);
    }
}
