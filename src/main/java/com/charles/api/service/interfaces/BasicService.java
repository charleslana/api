package com.charles.api.service.interfaces;

import com.charles.api.config.exceptions.BusinessRuleException;
import com.charles.api.model.dto.ResponseDTO;

public interface BasicService {

    BusinessRuleException getException(String message);

    ResponseDTO getSuccess(String message);
}
