package com.charles.api.service;

import com.charles.api.exceptions.BusinessException;
import com.charles.api.mapper.AccountMapper;
import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.entity.Account;
import com.charles.api.model.enums.RoleEnum;
import com.charles.api.model.enums.StatusEnum;
import com.charles.api.repository.AccountRepository;
import com.charles.api.utils.Utils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
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
        account.setStatus(StatusEnum.ACTIVE);
        account.setRole(RoleEnum.USER);
        repository.save(account);
        Utils utils = new Utils();
        return utils.responseSuccess("Conta criada com sucesso.");
    }

    public List<ListAccountDTO> getAll() {
        return repository.findAll().stream().map(mapper::toListDto).toList();
    }

    public List<GrantedAuthority> getRoles(String email) {
        Account account = getUserByEmail(email);
        return Collections.singletonList(new SimpleGrantedAuthority(RoleEnum.ADMIN.equals(account.getRole()) ? "ROLE_ADMIN" : "ROLE_USER"));
    }

    public Account getUserByEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> new BusinessException(String.format("E-mail %s não encontrado.", email)));
    }

    private void validateExistsEmail(CreateAccountDTO dto) {
        boolean existsEmail = repository.existsByEmail(dto.getEmail());
        if (existsEmail) {
            throw new BusinessException("Email já cadastrado.");
        }
    }
}
