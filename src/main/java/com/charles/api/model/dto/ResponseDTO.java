package com.charles.api.model.dto;

import com.charles.api.service.utils.LocaleUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.MessageSource;

import java.io.Serial;
import java.io.Serializable;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ResponseDTO implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @JsonIgnore
    private MessageSource ms;
    private String status;
    private String message;
    private String value;

    public ResponseDTO(MessageSource ms) {
        this.ms = ms;
        this.value = "";
    }

    public ResponseDTO(String status, String message, MessageSource ms) {
        this(status, message, null, LocaleUtils.currentLocale(), ms);
    }
    public ResponseDTO(String status, String message, Object value, MessageSource ms) {
        this(status, message, value, LocaleUtils.currentLocale(), ms);
    }
    public ResponseDTO(String status, String message, Object value, Locale locale, MessageSource ms) {
        this.status = ms.getMessage(status, null, locale);
        this.value = value != null ? checkConversion(value.toString(), ms, locale) : "";
        this.message = ms.getMessage(message, this.value.split(","), locale);
    }

    public ResponseDTO message(String message) {
        this.message = ms.getMessage(message, this.value.split(","), LocaleUtils.currentLocale());
        return this;
    }

    public ResponseDTO status(String status) {
        this.status = ms.getMessage(status, null, LocaleUtils.currentLocale());
        return this;
    }

    public ResponseDTO value(String value) {
        this.value = value != null ? checkConversion(value, ms, LocaleUtils.currentLocale()) : "";
        return this;
    }

    private String checkConversion(String value, MessageSource ms, Locale locale) {
        if (StringUtils.isNotEmpty(value)) {
            final String[] valueSplit = value.split(",");
            return Arrays.stream(valueSplit)
                    .map(valueData -> ms.getMessage(StringUtils.trim(valueData), null, StringUtils.trim(valueData), locale))
                    .collect(Collectors.joining(","));
        }
        return value;
    }
}
