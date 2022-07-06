package com.charles.api.service;

import com.charles.api.config.security.SecurityUtils;
import com.charles.api.exceptions.BusinessException;
import com.charles.api.mapper.AccountMapper;
import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.dto.UpdateAccountDTO;
import com.charles.api.model.entity.Account;
import com.charles.api.model.enums.RoleEnum;
import com.charles.api.model.enums.StatusEnum;
import com.charles.api.repository.AccountRepository;
import com.charles.api.utils.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AccountService implements UserDetailsService {

    private final BCryptPasswordEncoder encoder;
    private final AccountMapper mapper;
    private final AccountRepository repository;

    public ResponseDTO create(CreateAccountDTO dto) {
        validateExistsEmail(dto);
        validateExistsName(dto);
        Account account = mapper.toEntity(dto);
        account.setPassword(encoder.encode(dto.getPassword()));
        account.setStatus(StatusEnum.ACTIVE);
        account.setRole(RoleEnum.USER);
        repository.save(account);
        return Utils.responseSuccess("Conta criada com sucesso.");
    }

    public ListAccountDTO get() {
        Account existsAccount = getAuthAccount();
        return repository.findById(existsAccount.getId()).map(mapper::toListDto).orElseThrow(() -> new BusinessException("Conta não encontrada."));
    }

    public Account getAccountByEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> new BusinessException(String.format("E-mail %s não encontrado.", email)));
    }

    public List<ListAccountDTO> getAll() {
        return repository.findAll().stream().map(mapper::toListDto).toList();
    }

    public Account getAuthAccount() {
        String authEmail = SecurityUtils.getAuthEmail();
        return getAccountByEmail(authEmail);
    }

    public List<GrantedAuthority> getRoles(String email) {
        Account account = getAccountByEmail(email);
        return Collections.singletonList(new SimpleGrantedAuthority(RoleEnum.ADMIN.equals(account.getRole()) ? "ROLE_ADMIN" : "ROLE_USER"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Load user by username: {}", username);
        Account account = repository.findByEmailAndStatusNot(username, StatusEnum.INACTIVE).orElseThrow(() -> new UsernameNotFoundException(String.format("email %s does not exists or account not active", username)));
        List<GrantedAuthority> roles = Collections.singletonList(new SimpleGrantedAuthority(RoleEnum.ADMIN.equals(account.getRole()) ? "ROLE_ADMIN" : "ROLE_USER"));
        return new User(account.getEmail(), account.getPassword(), roles);
    }

    @Transactional
    public ResponseDTO update(UpdateAccountDTO dto) {
        validateExistsName(dto);
        Account existsAccount = getAuthAccount();
        existsAccount.setName(dto.getName());
        return Utils.responseSuccess("Conta atualizada com sucesso.");
    }

    private void validateExistsEmail(CreateAccountDTO dto) {
        boolean existsEmail = repository.existsByEmail(dto.getEmail());
        if (existsEmail) {
            throw new BusinessException("Email já está cadastrado.");
        }
    }

    private void validateExistsName(UpdateAccountDTO dto) {
        boolean existsName = repository.existsByName(dto.getName());
        if (existsName && !Objects.equals(getAuthAccount().getName(), dto.getName())) {
            throw new BusinessException("Nome já está em uso.");
        }
    }

    private void validateExistsName(CreateAccountDTO dto) {
        boolean existsName = repository.existsByName(dto.getName());
        if (existsName) {
            throw new BusinessException("Nome já está em uso.");
        }
    }
}
