package com.dev.SaeKimJP.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminMainManagerController {

	private final NoticeService noticeService;
	
	@GetMapping(value = {"", "/"})
    public String adminIndex() {
        return "administration/index";
    }
	
    @GetMapping("/mainBannerManager")
    public String mainBannerManager() {
        return "administration/main/mainBannerManager";
    }

    @GetMapping("/popupManager")
    public String popupManager() {
        return "administration/main/popupManager";
    }

    @GetMapping("/noticeManager")
    public String noticeManager(Model model) {
        model.addAttribute("noticeList", noticeService.getAdminList());
        return "administration/main/noticeManager";
    }
    
    @GetMapping("/faqManager")
    public String faqManager() {
        return "administration/main/faqManager";
    }
    
    @GetMapping("/eventManager")
    public String eventManageR() {
    	
    	return "administration/main/eventManager";
    }
    
    @GetMapping("/beforeAfterManager")
    public String beforeAfterManager() {
    	
    	return "administration/main/beforeAfterManager";
    }
    
    @GetMapping("/clientManager")
    public String clientManager() {
    	
    	return "administration/main/clientManager";
    }
    
    @GetMapping("/eyeSurgeryManager")
    public String eyeSurgeryManager(Model model) {
        model.addAttribute("groupType", SurgeryGroupType.EYE.name());
        model.addAttribute("groupLabel", SurgeryGroupType.EYE.getLabel());
        return "administration/surgery/eyeSurgeryManager";
    }
    
    @GetMapping("/noseSurgeryManager")
    public String noseSurgeryManager(Model model) {
        model.addAttribute("groupType", SurgeryGroupType.NOSE.name());
        model.addAttribute("groupLabel", SurgeryGroupType.NOSE.getLabel());
        return "administration/surgery/noseSurgeryManager";
    }
    
    @GetMapping("/youngSurgeryManager")
    public String youngSurgeryManager(Model model) {
        model.addAttribute("groupType", SurgeryGroupType.YOUNG.name());
        model.addAttribute("groupLabel", SurgeryGroupType.YOUNG.getLabel());
        return "administration/surgery/youngSurgeryManager";
    }
    
    @GetMapping("/contouringSurgeryManager")
    public String contouringSurgeryManager(Model model) {
        model.addAttribute("groupType", SurgeryGroupType.CONTOURING.name());
        model.addAttribute("groupLabel", SurgeryGroupType.CONTOURING.getLabel());
        return "administration/surgery/contouringSurgeryManager";
    }
}