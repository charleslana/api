package com.charles.api.controller;

import com.charles.api.model.dto.CreateAccountDTO;
import com.charles.api.model.dto.ListAccountDTO;
import com.charles.api.model.dto.ResponseDTO;
import com.charles.api.service.AccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
@Slf4j
public class AccountController {

    private final AccountService service;

    @PostMapping
    public ResponseEntity<ResponseDTO> create(@RequestBody @Valid CreateAccountDTO dto) {
        log.info("REST to get save entity: {}", dto);
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public List<ListAccountDTO> getAll() {
        log.info("REST to get all accounts");
        return service.getAll();
    }
}
