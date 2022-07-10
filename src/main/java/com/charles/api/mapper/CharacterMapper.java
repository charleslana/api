package com.charles.api.mapper;

import com.charles.api.model.dto.CreateCharacterDTO;
import com.charles.api.model.dto.ListCharacterDTO;
import com.charles.api.model.entity.Character;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CharacterMapper {

    CreateCharacterDTO toCreateDto(Character entity);

    ListCharacterDTO toListDto(Character entity);

    Character toEntity(CreateCharacterDTO dto);

    Character toEntity(ListCharacterDTO dto);
}
