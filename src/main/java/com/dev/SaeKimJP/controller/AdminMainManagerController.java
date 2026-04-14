package com.dev.SaeKimJP.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminMainManagerController {

    @GetMapping("/mainBannerManager")
    public String mainBannerManager() {
        return "administration/main/mainBannerManager";
    }

    @GetMapping("/popupManager")
    public String popupManager() {
        return "administration/main/popupManager";
    }
}