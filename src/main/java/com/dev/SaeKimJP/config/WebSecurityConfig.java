package com.dev.SaeKimJP.config;

import org.springframework.boot.autoconfigure.security.servlet.PathRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.thymeleaf.extras.springsecurity6.dialect.SpringSecurityDialect;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class WebSecurityConfig {

    private final String[] visitorsUrls = {
            "/",
            "/index",
            "/loginForm",
            "/signinProcess",
            "/logout",
            "/error/**",
            "/administration/assets/**",
            "/front/**",
            "/css/**",
            "/js/**",
            "/images/**",
            "/upload/**"
    };

    private final String[] adminsUrls = {
            "/admin/**"
    };

    @Bean
    HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    SpringSecurityDialect springSecurityDialect() {
        return new SpringSecurityDialect();
    }

    @Bean
    WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(PathRequest.toStaticResources().atCommonLocations());
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable())
            .headers(header -> header.frameOptions(frame -> frame.disable()))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(adminsUrls).hasAuthority("ROLE_ADMIN")
                .requestMatchers(visitorsUrls).permitAll()
                .anyRequest().permitAll()
            )
            .formLogin(form -> form
                .loginPage("/loginForm")
                .usernameParameter("username")
                .passwordParameter("password")
                .loginProcessingUrl("/signinProcess")
                .defaultSuccessUrl("/admin", true)
                .failureUrl("/loginForm?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .deleteCookies("JSESSIONID")
                .invalidateHttpSession(true)
                .logoutSuccessUrl("/loginForm?logout=true")
            );

        return http.build();
    }
}




















