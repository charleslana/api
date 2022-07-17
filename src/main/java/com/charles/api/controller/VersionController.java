package com.charles.api.controller;

import com.charles.api.service.VersionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/version")
@RequiredArgsConstructor
@Slf4j
public class VersionController {

    private final VersionService service;

    @GetMapping
    public ResponseEntity<String> get() {
        log.info("REST to get application version");
        return ResponseEntity.ok(service.get());
    }
}
