package com.charles.api.mapper;

import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.entity.Account;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AccountMapper {

    CreateAccountDTO toCreateDto(Account entity);

    ListAccountDTO toListDto(Account entity);

    Account toEntity(CreateAccountDTO dto);

    Account toEntity(ListAccountDTO dto);
}
