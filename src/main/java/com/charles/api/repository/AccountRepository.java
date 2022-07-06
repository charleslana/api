package com.charles.api.repository;

import com.charles.api.model.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    @Query("select a from Account a where a.email = ?1")
    Optional<Account> findByEmail(String email);

    @Query("select (count(a) > 0) from Account a where a.email = ?1")
    Boolean existsByEmail(String email);
}
