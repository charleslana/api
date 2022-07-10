package com.charles.api.controller;

import com.charles.api.model.dto.CreateCharacterDTO;
import com.charles.api.model.dto.ListCharacterDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.model.dto.UpdateCharacterDTO;
import com.charles.api.model.dto.UpdateCharacterNameDTO;
import com.charles.api.service.CharacterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/character")
@RequiredArgsConstructor
@Slf4j
public class CharacterController {

    private final CharacterService service;

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ResponseDTO> create(@RequestBody @Valid CreateCharacterDTO dto) {
        log.info("REST request to create entity: {}", dto);
        return ResponseEntity.ok(service.create(dto));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> delete(@PathVariable("id") Long id) {
        log.info("Rest request to delete character with id: {}", id);
        return ResponseEntity.ok(service.delete(id));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/details")
    public ResponseEntity<ListCharacterDTO> get() {
        log.info("REST to get character details");
        return ResponseEntity.ok(service.get());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<ListCharacterDTO>> getAll() {
        log.info("REST to get all characters");
        return ResponseEntity.ok(service.getAll());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/all")
    public ResponseEntity<List<ListCharacterDTO>> getAllByAccountId() {
        log.info("REST to get all characters by account id");
        return ResponseEntity.ok(service.getAllByAccountId());
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    public ResponseEntity<Void> logoutCharacter() {
        log.info("Rest request to logout character");
        service.logoutCharacter();
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}")
    public ResponseEntity<Void> selectCharacter(@PathVariable("id") Long id) {
        log.info("Rest request to select character");
        service.selectCharacter(id);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ResponseEntity<ResponseDTO> update(@RequestBody @Valid UpdateCharacterDTO dto) {
        log.info("REST request to update entity: {}", dto);
        return ResponseEntity.ok(service.update(dto));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/name")
    public ResponseEntity<ResponseDTO> updateName(@RequestBody @Valid UpdateCharacterNameDTO dto) {
        log.info("REST request to update character name: {}", dto.getName());
        return ResponseEntity.ok(service.updateName(dto));
    }
}
