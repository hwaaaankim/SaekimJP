package com.dev.SaeKimJP.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.dev.SaeKimJP.dto.community.FaqFrontListResponse;
import com.dev.SaeKimJP.dto.community.FrontNoticeListItemResponse;
import com.dev.SaeKimJP.dto.event.FrontEventIndexResponse;
import com.dev.SaeKimJP.dto.main.FrontMainBannerResponse;
import com.dev.SaeKimJP.dto.main.FrontMainPopupResponse;
import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.service.event.EventService;
import com.dev.SaeKimJP.service.faq.FaqService;
import com.dev.SaeKimJP.service.main.MainBannerService;
import com.dev.SaeKimJP.service.main.MainPopupService;
import com.dev.SaeKimJP.service.notice.NoticeService;
import com.dev.SaeKimJP.service.surgery.SurgeryFrontService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class IndexController {

    private final MainBannerService mainBannerService;
    private final MainPopupService mainPopupService;
    private final NoticeService noticeService;
    private final FaqService faqService;
    private final EventService eventService;
    private final SurgeryFrontService surgeryFrontService;

    @GetMapping({ "/", "/index", "" })
    public String index(Model model) {
        List<FrontMainBannerResponse> mainBanners = mainBannerService.getFrontList();
        List<FrontMainPopupResponse> visiblePopups = mainPopupService.getFrontVisibleList();
        List<FrontEventIndexResponse> indexEvents = eventService.getFrontIndexEvents(5);

        model.addAttribute("mainBanners", mainBanners);
        model.addAttribute("visiblePopups", visiblePopups);
        model.addAttribute("indexEvents", indexEvents);

        return "front/index";
    }

    @GetMapping("/eye")
    public String eye(Model model) {
        model.addAttribute("pageData", surgeryFrontService.getPage(SurgeryGroupType.EYE));
        return "front/eye";
    }

    @GetMapping("/nose")
    public String nose(Model model) {
        model.addAttribute("pageData", surgeryFrontService.getPage(SurgeryGroupType.NOSE));
        return "front/nose";
    }

    @GetMapping("/young")
    public String young(Model model) {
        model.addAttribute("pageData", surgeryFrontService.getPage(SurgeryGroupType.YOUNG));
        return "front/young";
    }

    @GetMapping("/contouring")
    public String contouring(Model model) {
        model.addAttribute("pageData", surgeryFrontService.getPage(SurgeryGroupType.CONTOURING));
        return "front/contouring";
    }

    @GetMapping("/notice")
    public String notice(@RequestParam(name = "searchText", defaultValue = "") String searchText,
                         @RequestParam(name = "page", defaultValue = "1") int page,
                         Model model) {

        Page<FrontNoticeListItemResponse> noticePage = noticeService.getFrontPage(searchText, page);

        model.addAttribute("noticePage", noticePage);
        model.addAttribute("searchText", searchText);
        model.addAttribute("currentPage", noticePage.getNumber() + 1);
        model.addAttribute("totalCount", noticePage.getTotalElements());
        model.addAttribute("pageNumbers",
                getVisiblePageNumbers(noticePage.getNumber() + 1, noticePage.getTotalPages(), 4));

        return "front/notice";
    }

    @GetMapping("/faq")
    public String faq(@RequestParam(value = "page", defaultValue = "1") int page,
                      @RequestParam(value = "keyword", required = false) String keyword,
                      Model model) {

        int currentPage = Math.max(page, 1);
        int pageSize = 10;

        Page<FaqFrontListResponse> faqPage = faqService.getFrontFaqPage(
                keyword,
                PageRequest.of(currentPage - 1, pageSize, Sort.by(Sort.Order.desc("id")))
        );

        int totalPages = Math.max(faqPage.getTotalPages(), 1);
        int startPage = ((currentPage - 1) / 4) * 4 + 1;
        int endPage = Math.min(startPage + 3, totalPages);

        model.addAttribute("faqPage", faqPage);
        model.addAttribute("faqList", faqPage.getContent());
        model.addAttribute("keyword", keyword == null ? "" : keyword.trim());
        model.addAttribute("currentPage", currentPage);
        model.addAttribute("startPage", startPage);
        model.addAttribute("endPage", endPage);
        model.addAttribute("totalCount", faqPage.getTotalElements());

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

    private List<Integer> getVisiblePageNumbers(int currentPage, int totalPages, int maxVisibleCount) {
        List<Integer> result = new ArrayList<>();
        if (totalPages <= 0) {
            return result;
        }

        int startPage = Math.max(1, currentPage - 1);
        int endPage = Math.min(totalPages, startPage + maxVisibleCount - 1);

        if (endPage - startPage + 1 < maxVisibleCount) {
            startPage = Math.max(1, endPage - maxVisibleCount + 1);
        }

        for (int i = startPage; i <= endPage; i++) {
            result.add(i);
        }
        return result;
    }
}