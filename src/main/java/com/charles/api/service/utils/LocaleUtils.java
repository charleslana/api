package com.charles.api.service.utils;

import org.springframework.context.i18n.LocaleContextHolder;

import java.util.Locale;

public class LocaleUtils {

    private LocaleUtils() {
    }

    public static Locale currentLocale() {
        return LocaleContextHolder.getLocale();
    }

    public static boolean isPortuguese() {
        return currentLocale().toLanguageTag().equals("pt-BR");
    }
}
