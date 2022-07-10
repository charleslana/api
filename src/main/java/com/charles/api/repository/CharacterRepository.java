package com.charles.api.repository;

import com.charles.api.model.entity.Character;
import com.charles.api.model.enums.BannedEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CharacterRepository extends JpaRepository<Character, Long> {

    @Query("select (count(c) > 0) from Character c where c.name = ?1")
    Boolean existsByName(String name);

    @Query("select c from Character c where c.account.id = ?1")
    List<Character> findAllByAccountId(Long id);

    @Query("select c from Character c where c.account.id = ?1 and c.id = ?2 and c.banned = ?3")
    Optional<Character> findByAccountIdAndIdAndBanned(Long accountId, Long id, BannedEnum banned);
}
