package com.dev.SaeKimJP.controller.api;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.dto.community.FaqTopicResponse;
import com.dev.SaeKimJP.dto.community.FaqTopicSaveRequest;
import com.dev.SaeKimJP.service.faq.FaqTopicService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/faq-topics")
public class AdminFaqTopicApiController {

    private final FaqTopicService faqTopicService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FaqTopicResponse>>> getTopics() {
        return ResponseEntity.ok(ApiResponse.of(true, "FAQ 주제 목록 조회 성공", faqTopicService.getTopics()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTopic(@RequestBody FaqTopicSaveRequest request) {
        try {
            Long topicId = faqTopicService.createTopic(request);

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("topicId", topicId);

            return ResponseEntity.ok(ApiResponse.of(true, "FAQ 주제가 등록되었습니다.", data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.of(false, e.getMessage(), null));
        }
    }

    @PutMapping("/{topicId}")
    public ResponseEntity<ApiResponse<Void>> updateTopic(
            @PathVariable Long topicId,
            @RequestBody FaqTopicSaveRequest request
    ) {
        try {
            faqTopicService.updateTopic(topicId, request);
            return ResponseEntity.ok(ApiResponse.of(true, "FAQ 주제가 수정되었습니다.", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.of(false, e.getMessage(), null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.of(false, e.getMessage(), null));
        }
    }

    @DeleteMapping("/{topicId}")
    public ResponseEntity<ApiResponse<Void>> deleteTopic(@PathVariable Long topicId) {
        try {
            faqTopicService.deleteTopic(topicId);
            return ResponseEntity.ok(ApiResponse.of(true, "FAQ 주제가 삭제되었습니다.", null));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.of(false, e.getMessage(), null));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.of(false, e.getMessage(), null));
        }
    }
}
