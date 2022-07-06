package com.charles.api.config.security;

import com.charles.api.config.PropertiesConfig;
import com.charles.api.config.security.filter.CustomAuthenticationFilter;
import com.charles.api.config.security.filter.CustomAuthorizationFilter;
import com.charles.api.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Collections;

@Configuration
@RequiredArgsConstructor
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true, jsr250Enabled = true)
public class SecurityConfig {

    private final PropertiesConfig propertiesConfig;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder getEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    protected SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        AuthenticationManager authenticationManager = http.getSharedObject(AuthenticationManager.class);
        AccountService service = http.getSharedObject(AccountService.class);
        http.httpBasic().disable();
        http.logout().deleteCookies("JSESSIONID");
        http.csrf().disable().authorizeRequests().anyRequest().permitAll().and().cors().configurationSource(request -> getCorsConfiguration());
        http.addFilter(new CustomAuthenticationFilter(authenticationManager, propertiesConfig, service));
        http.addFilterBefore(new CustomAuthorizationFilter(propertiesConfig, service), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    private CorsConfiguration getCorsConfiguration() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedHeaders(Collections.singletonList("*"));
        config.setAllowedMethods(Collections.singletonList("*"));
        config.addAllowedOrigin("*");
        return config;
    }
}
