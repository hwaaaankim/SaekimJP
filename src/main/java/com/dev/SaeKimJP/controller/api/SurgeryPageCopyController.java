package com.dev.SaeKimJP.controller.api;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import com.dev.SaeKimJP.service.surgery.SurgeryPageCopyService;

@RestController
@RequestMapping("/admin/api/surgery-page-copy")
public class SurgeryPageCopyController {
    public static final String TOKEN_ATTRIBUTE = "SURGERY_COPY_EDIT_TOKEN";
    private final SurgeryPageCopyService service;
    public SurgeryPageCopyController(SurgeryPageCopyService service) { this.service = service; }
    public record UpdateRequest(String content, Long version) {}

    @PutMapping("/{page}/{key}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public SurgeryPageCopyService.Copy update(@PathVariable("page") String page,
            @PathVariable("key") String key, @RequestBody UpdateRequest body,
            @RequestHeader(value="X-Surgery-Edit-Token", required=false) String token,
            HttpServletRequest request, Authentication authentication) {
        // This application disables global CSRF. Protect this mutation with a session-bound token.
        HttpSession session = request.getSession(false);
        Object expected = session == null ? null : session.getAttribute(TOKEN_ATTRIBUTE);
        if (!(expected instanceof String) || token == null || !MessageDigest.isEqual(
                ((String) expected).getBytes(StandardCharsets.UTF_8), token.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return service.update(page, key, body.content(), body.version(), authentication.getName());
    }
}
