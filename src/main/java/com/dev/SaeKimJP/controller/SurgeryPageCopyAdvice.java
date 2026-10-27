package com.dev.SaeKimJP.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.ui.Model;
import com.dev.SaeKimJP.service.surgery.SurgeryPageCopyService;
import com.dev.SaeKimJP.controller.api.SurgeryPageCopyController;

@ControllerAdvice(assignableTypes = IndexController.class)
public class SurgeryPageCopyAdvice {
    private final SurgeryPageCopyService service;
    public SurgeryPageCopyAdvice(SurgeryPageCopyService service) { this.service = service; }
    @ModelAttribute
    public void populate(HttpServletRequest request, HttpServletResponse response, Authentication authentication, Model model) {
        String path = request.getServletPath();
        if (!path.matches("/(eye|nose|young|contouring)SurgeryP(age|gae)")) return;
        String page = path.substring(1, path.indexOf("Surgery"));
        Map<String, String> text = new LinkedHashMap<>();
        Map<String, Long> versions = new LinkedHashMap<>();
        service.findPage(page).forEach((key, value) -> { text.put(key, value.content()); versions.put(key, value.version()); });
        boolean admin = authentication != null && authentication.isAuthenticated()
            && authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        String token = "";
        if (admin) {
            HttpSession session = request.getSession();
            synchronized (session) {
                token = (String) session.getAttribute(SurgeryPageCopyController.TOKEN_ATTRIBUTE);
                if (token == null) {
                    token = UUID.randomUUID().toString();
                    session.setAttribute(SurgeryPageCopyController.TOKEN_ATTRIBUTE, token);
                }
            }
        }
        response.setHeader("Cache-Control", "no-store");
        model.addAttribute("surgeryCopy", text);
        model.addAttribute("surgeryVersions", versions);
        model.addAttribute("surgeryCanEdit", admin);
        model.addAttribute("surgeryEditToken", token);
    }
}
