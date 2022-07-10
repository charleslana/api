package com.charles.api.model.dto;

import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.io.Serializable;
import java.util.Collection;

@AllArgsConstructor
public class UserDetailsDTO implements Serializable, UserDetails {
    @Serial
    private static final long serialVersionUID = 1L;

    private Collection<? extends GrantedAuthority> authorities;
    private Long characterId;
    private String password;
    private String username;

    public UserDetailsDTO(Collection<? extends GrantedAuthority> authorities, String password, String username) {
        this.authorities = authorities;
        this.password = password;
        this.username = username;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public Long getCharacterId() {
        return characterId;
    }

    public void setCharacterId(Long id) {
        this.characterId = id;
    }
}
