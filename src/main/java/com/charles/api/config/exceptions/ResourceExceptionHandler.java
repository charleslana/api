package com.charles.api.config.exceptions;

import com.charles.api.config.exceptions.dto.FieldErrorDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ResourceExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<FieldErrorDTO> errorBusiness(BusinessException exception) {
        FieldErrorDTO error = new FieldErrorDTO(exception.getProperty(), exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<FieldErrorDTO> errorBusiness(AccessDeniedException exception) {
        FieldErrorDTO error = new FieldErrorDTO(exception.getMessage(), exception.getLocalizedMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<FieldErrorDTO> errorBusiness(HttpMediaTypeNotSupportedException exception) {
        FieldErrorDTO error = new FieldErrorDTO(exception.getMessage(), exception.getLocalizedMessage());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<FieldErrorDTO> errorBusiness(HttpMessageNotReadableException exception) {
        FieldErrorDTO error = new FieldErrorDTO("error", "body request error");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<FieldErrorDTO> methodNoSupported(HttpRequestMethodNotSupportedException exception) {
        FieldErrorDTO error = new FieldErrorDTO(exception.getMessage(), String.format("O método %s para esse endpoint não é suportador pelo sistema", exception.getMethod()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
