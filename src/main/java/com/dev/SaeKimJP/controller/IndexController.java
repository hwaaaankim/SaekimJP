package com.dev.SaeKimJP.controller;

import java.util.List;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.dev.SaeKimJP.dto.main.FrontMainBannerResponse;
import com.dev.SaeKimJP.dto.main.FrontMainPopupResponse;
import com.dev.SaeKimJP.service.main.MainBannerService;
import com.dev.SaeKimJP.service.main.MainPopupService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class IndexController {

	private final MainBannerService mainBannerService;
    private final MainPopupService mainPopupService;

    @GetMapping({"/", "/index", ""})
    public String index(Model model) {
        List<FrontMainBannerResponse> mainBanners = mainBannerService.getFrontList();
        List<FrontMainPopupResponse> visiblePopups = mainPopupService.getFrontVisibleList();

        model.addAttribute("mainBanners", mainBanners);
        model.addAttribute("visiblePopups", visiblePopups);

        return "front/index";
    }
	
	@GetMapping("/eye")
	public String eye() {
		
		return "front/eye";
	}
	
	@GetMapping("/young")
	public String young() {
		
		return "front/young";
	}
	
	@GetMapping("/contouring")
	public String contouring() {
		
		return "front/contouring";
	}
	
	@GetMapping("/nose")
	public String nose() {
		
		return "front/nose";
	}

	@GetMapping("/notice")
	public String notice() {
		
		return "front/notice";
	}
	
	@GetMapping("/faq")
	public String faq() {
		
		return "front/faq";
	}
	
	@GetMapping("/contact")
	public String contact() {
		
		return "front/contact";
	}
	
	@GetMapping("/about")
	public String about() {
		
		return "front/about";
	}
	
	@GetMapping("/beforeAfter")
	public String beforeAfter() {
		
		return "front/beforeAfter";
	}
	
	@GetMapping("/event")
	public String event() {
		
		return "front/event";
	}
	
}
