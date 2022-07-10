package com.charles.api.service;

import com.charles.api.config.exceptions.BusinessRuleException;
import com.charles.api.config.security.SecurityUtils;
import com.charles.api.mapper.CharacterMapper;
import com.charles.api.model.dto.CreateCharacterDTO;
import com.charles.api.model.dto.ListCharacterDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.dto.UpdateCharacterDTO;
import com.charles.api.model.dto.UpdateCharacterNameDTO;
import com.charles.api.model.entity.Attribute;
import com.charles.api.model.entity.Character;
import com.charles.api.model.enums.BannedEnum;
import com.charles.api.repository.CharacterRepository;
import com.charles.api.service.interfaces.BasicService;
import com.charles.api.service.utils.LocaleUtils;
import com.charles.api.service.utils.MessageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CharacterService implements BasicService {

    private final AccountService accountService;
    private final CharacterMapper mapper;
    private final MessageSource ms;
    private final CharacterRepository repository;

    @Transactional
    public ResponseDTO create(CreateCharacterDTO dto) {
        validateExistsName(dto);
        validateCountExceeded();
        Character character = mapper.toEntity(dto);
        character.setImage("1");
        character.setLevel(1L);
        character.setBanned(BannedEnum.NO);
        character.setAttribute(getAttribute());
        character.setAccount(accountService.getAuthAccount());
        repository.save(character);
        return getSuccess("character.created");
    }

    @Transactional
    public ResponseDTO delete(Long id) {
        Character character = getCharacterId(id);
        repository.delete(character);
        return getSuccess("character.delete");
    }

    public ListCharacterDTO get() {
        return repository.findById(getAuthCharacter().getId()).map(mapper::toListDto).orElseThrow(() -> getException("character.not.found"));
    }

    public List<ListCharacterDTO> getAll() {
        return repository.findAll().stream().map(mapper::toListDto).toList();
    }

    public List<ListCharacterDTO> getAllByAccountId() {
        return repository.findAllByAccountId(accountService.getAuthAccount().getId()).stream().map(mapper::toListDto).toList();
    }

    public Character getAuthCharacter() {
        existsCharacterId();
        return getCharacterId(SecurityUtils.getUserDetails().getCharacterId());
    }

    @Override
    public BusinessRuleException getException(String message) {
        return new BusinessRuleException(MessageUtils.CHARACTER_EXCEPTION, message);
    }

    @Override
    public ResponseDTO getSuccess(String message) {
        return new ResponseDTO(MessageUtils.CHARACTER_SUCCESS, message, null, LocaleUtils.currentLocale(), ms);
    }

    public void logoutCharacter() {
        existsCharacterId();
        SecurityUtils.removeCharacterId();
    }

    public void selectCharacter(Long id) {
        SecurityUtils.setCharacterId(getCharacterId(id).getId());
    }

    @Transactional
    public ResponseDTO update(UpdateCharacterDTO dto) {
        Character authCharacter = getAuthCharacter();
        authCharacter.setGender(dto.getGender());
        return getSuccess("character.updated");
    }

    @Transactional
    public ResponseDTO updateName(UpdateCharacterNameDTO dto) {
        validateExistsName(dto);
        Character authCharacter = getAuthCharacter();
        authCharacter.setName(dto.getName());
        return getSuccess("character.updated");
    }

    private void existsCharacterId() {
        if (Boolean.FALSE.equals(SecurityUtils.existsCharacterId())) {
            throw getException("character.not.found");
        }
    }

    private Attribute getAttribute() {
        Attribute attribute = new Attribute();
        attribute.setStrength(1L);
        attribute.setDefense(1L);
        attribute.setLife(1L);
        attribute.setEnergy(1L);
        attribute.setAgility(1L);
        attribute.setResistance(1L);
        attribute.setIntelligence(1L);
        return attribute;
    }

    private Character getCharacterId(Long id) {
        return repository.findByAccountIdAndIdAndBanned(accountService.getAuthAccount().getId(), id, BannedEnum.NO).orElseThrow(() -> getException("character.not.found"));
    }

    private void validateCountExceeded() {
        if (repository.count() >= 4) {
            throw getException("character.count.exceeded");
        }
    }

    private void validateExistsName(UpdateCharacterNameDTO dto) {
        boolean existsByName = repository.existsByName(dto.getName());
        if (existsByName && !Objects.equals(getAuthCharacter().getName(), dto.getName())) {
            throw getException("character.exists.name");
        }
    }

    private void validateExistsName(CreateCharacterDTO dto) {
        boolean existsByName = repository.existsByName(dto.getName());
        if (existsByName) {
            throw getException("character.exists.name");
        }
    }
}
