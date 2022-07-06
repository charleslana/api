package com.charles.api.utils;

import com.charles.api.model.dto.ResponseDTO;

public class Utils {

    public ResponseDTO responseSuccess(String message) {
        ResponseDTO dto = new ResponseDTO();
        dto.setStatus("success");
        dto.setTimestamp(System.currentTimeMillis());
        dto.setMessage(message);
        return dto;
    }
}
