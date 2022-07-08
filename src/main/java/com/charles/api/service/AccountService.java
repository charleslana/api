package com.charles.api.service;

import com.charles.api.config.exceptions.BusinessRuleException;
import com.charles.api.config.security.SecurityUtils;
import com.charles.api.mapper.AccountMapper;
import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.dto.UpdateAccountDTO;
import com.charles.api.model.entity.Account;
import com.charles.api.model.entity.Attribute;
import com.charles.api.model.enums.RoleEnum;
import com.charles.api.model.enums.StatusEnum;
import com.charles.api.repository.AccountRepository;
import com.charles.api.service.interfaces.BasicService;
import com.charles.api.service.utils.LocaleUtils;
import com.charles.api.service.utils.MessageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
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
public class AccountService implements UserDetailsService, BasicService {

    private final BCryptPasswordEncoder encoder;
    private final AccountMapper mapper;
    private final MessageSource ms;
    private final AccountRepository repository;

    public ResponseDTO create(CreateAccountDTO dto) {
        validateExistsEmail(dto);
        validateExistsName(dto);
        Account account = mapper.toEntity(dto);
        account.setPassword(encoder.encode(dto.getPassword()));
        account.setStatus(StatusEnum.ACTIVE);
        account.setRole(RoleEnum.USER);
        account.setAttribute(getAttribute());
        repository.save(account);
        return getSuccess("account.created");
    }

    public ListAccountDTO get() {
        Account existsAccount = getAuthAccount();
        return repository.findById(existsAccount.getId()).map(mapper::toListDto).orElseThrow(() -> getException("account.not.found"));
    }

    public Account getAccountByEmail(String email) {
        return repository.findByEmail(email).orElseThrow(() -> getException("account.not.exists.email"));
    }

    public List<ListAccountDTO> getAll() {
        return repository.findAll().stream().map(mapper::toListDto).toList();
    }

    public Account getAuthAccount() {
        String authEmail = SecurityUtils.getAuthEmail();
        return getAccountByEmail(authEmail);
    }

    @Override
    public BusinessRuleException getException(String message) {
        return new BusinessRuleException(MessageUtils.ACCOUNT_EXCEPTION, message);
    }

    @Override
    public ResponseDTO getSuccess(String message) {
        return new ResponseDTO(MessageUtils.ACCOUNT_SUCCESS, message, null, LocaleUtils.currentLocale(), ms);
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
        return getSuccess("account.updated");
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

    private void validateExistsEmail(CreateAccountDTO dto) {
        boolean existsEmail = repository.existsByEmail(dto.getEmail());
        if (existsEmail) {
            throw getException("account.exists.email");
        }
    }

    private void validateExistsName(UpdateAccountDTO dto) {
        boolean existsName = repository.existsByName(dto.getName());
        if (existsName && !Objects.equals(getAuthAccount().getName(), dto.getName())) {
            throw getException("account.exists.name");
        }
    }

    private void validateExistsName(CreateAccountDTO dto) {
        boolean existsName = repository.existsByName(dto.getName());
        if (existsName) {
            throw getException("account.exists.name");
        }
    }
}
