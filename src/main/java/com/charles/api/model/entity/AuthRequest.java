package com.charles.api.model.entity;

import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.Email;
import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class AuthRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Email
    @Length(max = 50)
    private String email;

    @Length(min = 6)
    private String password;
}
