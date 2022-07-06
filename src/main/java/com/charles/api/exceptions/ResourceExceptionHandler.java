package com.charles.api.exceptions;

import com.charles.api.model.dto.ResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;

@ControllerAdvice
public class ResourceExceptionHandler {

    private static final String ERROR = "error";

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseDTO> errorBusiness(BusinessException e, HttpServletRequest request) {
        ResponseDTO error = new ResponseDTO();
        error.setStatus(ERROR);
        error.setTimestamp(System.currentTimeMillis());
        error.setMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ResponseDTO> errorBusiness(AccessDeniedException exception) {
        ResponseDTO error = new ResponseDTO();
        error.setStatus(ERROR);
        error.setTimestamp(System.currentTimeMillis());
        error.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ResponseDTO> errorBusiness(HttpMediaTypeNotSupportedException exception) {
        ResponseDTO error = new ResponseDTO();
        error.setStatus(ERROR);
        error.setTimestamp(System.currentTimeMillis());
        error.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).body(error);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ResponseDTO> methodNotSupportErrorHandler(HttpRequestMethodNotSupportedException exception) {
        ResponseDTO error = new ResponseDTO();
        error.setStatus(ERROR);
        error.setTimestamp(System.currentTimeMillis());
        error.setMessage(exception.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
