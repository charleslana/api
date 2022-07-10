package com.charles.api.account;

import com.charles.api.model.entity.Account;
import com.charles.api.model.enums.RoleEnum;
import com.charles.api.model.enums.StatusEnum;
import com.charles.api.repository.AccountRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.Rollback;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Rollback(value = false)
class AccountRepositoryTest {

    @Autowired
    AccountRepository repository;

    @Test
    void testCreateAccount() {
        PasswordEncoder encoder = new BCryptPasswordEncoder();
        Account account = new Account();
        account.setEmail("example@example.com");
        account.setPassword(encoder.encode("123456"));
        account.setStatus(StatusEnum.ACTIVE);
        account.setRole(RoleEnum.USER);
        Account savedAccount = repository.save(account);
        Assertions.assertNotNull(savedAccount);
        Assertions.assertTrue(savedAccount.getId() > 0);
    }
}
