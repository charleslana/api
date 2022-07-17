package com.charles.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VersionService {

    private final String version = "1.0.0";

    public String get() {
        return version;
    }
}
