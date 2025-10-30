package com.dev.SaeKimJP.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

	@GetMapping({"/", "/index", ""})
	public String index() {
		
		return "front/index";
	}
	
	@GetMapping("/surgerySimple")
	public String surgerySimple() {
		
		return "front/surgerySimple";
	}
	
	@GetMapping("/surgeryDetail")
	public String surgeryDetail() {
		
		return "front/surgeryDetail";
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
}
