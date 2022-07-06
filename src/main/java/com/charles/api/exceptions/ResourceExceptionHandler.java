package com.charles.api.exceptions;

import com.charles.api.model.dto.ResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.servlet.http.HttpServletRequest;

@ControllerAdvice
public class ResourceExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ResponseDTO> errorBusiness(BusinessException e, HttpServletRequest request) {
        ResponseDTO error = new ResponseDTO();
        error.setStatus("error");
        error.setTimestamp(System.currentTimeMillis());
        error.setMessage(e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
