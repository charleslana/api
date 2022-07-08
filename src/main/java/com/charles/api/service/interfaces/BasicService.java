package com.charles.api.service.interfaces;

import com.charles.api.config.exceptions.BusinessException;
import com.charles.api.model.dto.ResponseDTO;

public interface BasicService {

    BusinessException getException(String message);

    ResponseDTO getSuccess(String message);
}
