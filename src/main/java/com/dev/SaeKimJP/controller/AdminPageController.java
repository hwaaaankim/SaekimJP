package com.dev.SaeKimJP.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminPageController {

    @GetMapping("/loginForm")
    public String loginForm() {
        return "administration/login";
    }
}