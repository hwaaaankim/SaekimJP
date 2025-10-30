package com.dev.SaeKimJP.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class IndexController {

	@GetMapping({"/", "/index", ""})
	public String index() {
		
		return "front/index";
	}
	
	@GetMapping("/surgery")
	public String surgery() {
		
		return "front/surgery";
	}
	
	@GetMapping("/community")
	public String community() {
		
		return "front/community";
	}
	
	@GetMapping("/system")
	public String system() {
		
		return "front/system";
	}
}
