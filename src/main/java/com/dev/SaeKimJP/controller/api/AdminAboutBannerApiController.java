package com.dev.SaeKimJP.controller.api;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.UUID;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.dev.SaeKimJP.dto.main.AboutBannerRequest;
import com.dev.SaeKimJP.service.main.AboutBannerService;
import lombok.RequiredArgsConstructor;

@RestController @RequiredArgsConstructor @RequestMapping("/admin/api/about-banner")
public class AdminAboutBannerApiController {
    private static final String TOKEN_KEY = "ABOUT_BANNER_EDIT_TOKEN";
    private final AboutBannerService service;
    @GetMapping public Map<String, Object> get(HttpSession session) {
        synchronized (session) {
            if (session.getAttribute(TOKEN_KEY) == null) session.setAttribute(TOKEN_KEY, UUID.randomUUID().toString());
        }
        return Map.of("banner", service.get(), "token", session.getAttribute(TOKEN_KEY));
    }
    @PostMapping public Object save(@ModelAttribute AboutBannerRequest request,
            @RequestHeader(value = "X-About-Banner-Token", required = false) String token, HttpSession session) {
        Object expected = session.getAttribute(TOKEN_KEY);
        if (!(expected instanceof String) || token == null || !MessageDigest.isEqual(
                ((String) expected).getBytes(StandardCharsets.UTF_8), token.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "로그인 상태를 확인한 뒤 다시 조회해 주세요.");
        return service.save(request);
    }
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", e.getReason()));
    }
    @ExceptionHandler({OptimisticLockingFailureException.class, DataIntegrityViolationException.class})
    public ResponseEntity<?> conflict(Exception e) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "다른 관리자가 변경했습니다. 내용을 복사해 두고 새로 조회해 주세요."));
    }
}
