package com.dev.SaeKimJP.controller.api;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.dto.community.FaqAdminDetailResponse;
import com.dev.SaeKimJP.dto.community.FaqAdminListResponse;
import com.dev.SaeKimJP.dto.community.FaqSaveRequest;
import com.dev.SaeKimJP.service.faq.FaqService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/faqs")
public class AdminFaqApiController {

    private final FaqService faqService;

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createFaq(@RequestBody FaqSaveRequest request) {
        try {
            Long faqId = faqService.createFaq(request);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("faqId", faqId);

            return ResponseEntity.ok(ApiResponse.of(true, "FAQ가 등록되었습니다.", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.of(false, e.getMessage(), null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.of(false, e.getMessage(), null));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<FaqAdminListResponse>>> getFaqList(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "12") int size,
            @RequestParam(value = "keyword", required = false) String keyword,
            @RequestParam(value = "topicId", required = false) Long topicId
    ) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(Sort.Order.desc("id"))
        );

        Page<FaqAdminListResponse> faqPage = faqService.getAdminFaqPage(keyword, topicId, pageable);
        return ResponseEntity.ok(ApiResponse.of(true, "FAQ 목록 조회 성공", faqPage));
    }

    @GetMapping("/{faqId}")
    public ResponseEntity<ApiResponse<FaqAdminDetailResponse>> getFaqDetail(@PathVariable Long faqId) {
        try {
            FaqAdminDetailResponse detail = faqService.getAdminFaqDetail(faqId);
            return ResponseEntity.ok(ApiResponse.of(true, "FAQ 상세 조회 성공", detail));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.of(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{faqId}")
    public ResponseEntity<ApiResponse<Void>> updateFaq(
            @PathVariable Long faqId,
            @RequestBody FaqSaveRequest request
    ) {
        try {
            faqService.updateFaq(faqId, request);
            return ResponseEntity.ok(ApiResponse.of(true, "FAQ가 수정되었습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.of(false, e.getMessage(), null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.of(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{faqId}")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable Long faqId) {
        try {
            faqService.deleteFaq(faqId);
            return ResponseEntity.ok(ApiResponse.of(true, "FAQ가 삭제되었습니다.", null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.of(false, e.getMessage(), null));
        }
    }
}
