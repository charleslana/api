package com.charles.api.config.exceptions;

import com.charles.api.config.exceptions.dto.ApiErrorDTO;
import com.charles.api.service.utils.MessageUtils;
import lombok.AllArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Locale;

@ControllerAdvice
@AllArgsConstructor
public class ResourceExceptionHandler {

    private final MessageSource ms;

    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiErrorDTO> errorBusiness(BusinessRuleException exception, Locale locale) {
        ApiErrorDTO error = new ApiErrorDTO(MessageUtils.ACCOUNT_EXCEPTION, exception.getMessage(), null, ms, locale);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorDTO> errorBusiness(AccessDeniedException exception) {
        ApiErrorDTO error = new ApiErrorDTO(HttpStatus.UNAUTHORIZED.toString(), exception.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorDTO> errorBusiness(HttpMediaTypeNotSupportedException exception) {
        ApiErrorDTO error = new ApiErrorDTO(HttpStatus.UNSUPPORTED_MEDIA_TYPE.toString(), exception.getMessage());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorDTO> errorBusiness(HttpMessageNotReadableException exception) {
        ApiErrorDTO error = new ApiErrorDTO(HttpStatus.BAD_REQUEST.toString(), "body request error");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorDTO> methodNoSupported(HttpRequestMethodNotSupportedException exception) {
        ApiErrorDTO error = new ApiErrorDTO(HttpStatus.BAD_REQUEST.toString(), String.format("The %s method for this endpoint is not supported by the system", exception.getMethod()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
