package com.charles.api.config.exceptions;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ResourceBundle;
import java.util.function.Supplier;

@Getter
@Setter
@Component
@NoArgsConstructor
@AllArgsConstructor
public class BusinessException extends RuntimeException implements Supplier<BusinessException> {

    private String property;
    private String message;
    private LocalDate date;
    private final String basePathMessage = "message/message_";

    public BusinessException(String key, String value) {
        String keyMessage = getKey(key);
        String valueMessage = getMessage(value);
        throw new BusinessException(keyMessage, valueMessage, LocalDate.now());
    }

    @Override
    public BusinessException get() {
        return null;
    }


    private String getKey(String key) {
        return ResourceBundle.getBundle(String.format("%s%s",basePathMessage,"default"), LocaleContextHolder.getLocale()).getString(key);
    }

    private String getMessage(String value) {
        return ResourceBundle.getBundle(String.format("%s%s",basePathMessage,"error"), LocaleContextHolder.getLocale()).getString(value);
    }
}
