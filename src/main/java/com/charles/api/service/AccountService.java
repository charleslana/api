package com.charles.api.service;

import com.charles.api.exceptions.BusinessException;
import com.charles.api.mapper.AccountMapper;
import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.entity.Account;
import com.charles.api.repository.AccountRepository;
import com.charles.api.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final BCryptPasswordEncoder encoder;
    private final AccountMapper mapper;
    private final AccountRepository repository;

    public ResponseDTO create(CreateAccountDTO dto) {
        validateExistsEmail(dto);
        Account account = mapper.toEntity(dto);
        account.setPassword(encoder.encode(dto.getPassword()));
        repository.save(account);
        Utils utils = new Utils();
        return utils.responseSuccess("Conta criada com sucesso.");
    }

    public List<ListAccountDTO> getAll() {
        return repository.findAll().stream().map(mapper::toListDto).toList();
    }

    private void validateExistsEmail(CreateAccountDTO dto) {
        boolean existsEmail = repository.existsByEmail(dto.getEmail());
        if (existsEmail) {
            throw new BusinessException("Email já cadastrado.");
        }
    }
}
