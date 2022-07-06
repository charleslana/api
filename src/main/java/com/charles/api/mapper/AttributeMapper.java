package com.charles.api.mapper;

import com.charles.api.model.dto.ListAttributeDTO;
import com.charles.api.model.entity.Attribute;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AttributeMapper {

    ListAttributeDTO toListDto(Attribute entity);

    Attribute toEntity(ListAttributeDTO dto);
}
