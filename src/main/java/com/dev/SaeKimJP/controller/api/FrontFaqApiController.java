package com.dev.SaeKimJP.controller.api;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.service.faq.FaqService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/faqs")
public class FrontFaqApiController {

    private final FaqService faqService;

    @PostMapping("/{faqId}/view-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> increaseViewCount(@PathVariable Long faqId) {
        try {
            long viewCount = faqService.increaseViewCount(faqId);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("faqId", faqId);
            data.put("viewCount", viewCount);

            return ResponseEntity.ok(ApiResponse.of(true, "조회수가 증가되었습니다.", data));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.of(false, e.getMessage(), null));
        }
    }
}