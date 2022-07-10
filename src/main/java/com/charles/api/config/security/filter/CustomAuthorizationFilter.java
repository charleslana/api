package com.charles.api.config.security.filter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.charles.api.config.PropertiesConfig;
import com.charles.api.config.exceptions.dto.ApiErrorDTO;
import com.charles.api.service.AccountService;
import com.charles.api.service.utils.LocaleUtils;
import com.charles.api.service.utils.MessageUtils;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
@NoArgsConstructor
@AllArgsConstructor
public class CustomAuthorizationFilter extends OncePerRequestFilter {

    private PropertiesConfig propertiesConfig;
    private AccountService service;
    private MessageSource ms;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (SecurityContextHolder.getContext() == null && authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            try {
                SecurityContextHolder.getContext().setAuthentication(processMethod(authorizationHeader));
            } catch (Exception e) {
                log.warn("Authentication failed for token {}, caused by: {}", authorizationHeader, e.getMessage());
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                ApiErrorDTO error = new ApiErrorDTO(MessageUtils.ACCOUNT_EXCEPTION, e.getMessage(), null, ms, LocaleUtils.currentLocale());
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                new ObjectMapper().writeValue(response.getOutputStream(), error);
            }
        }
        filterChain.doFilter(request, response);
    }

    private UsernamePasswordAuthenticationToken processMethod(String authorizationHeader) {
        String token = authorizationHeader.substring("Bearer ".length());
        Algorithm algorithm = Algorithm.HMAC256(propertiesConfig.getSecret().getBytes());
        JWTVerifier verifier = JWT.require(algorithm).build();
        DecodedJWT decodedJWT = verifier.verify(token);
        String username = decodedJWT.getSubject();
        return new UsernamePasswordAuthenticationToken(username, null, service.getRoles(username));
    }
}
