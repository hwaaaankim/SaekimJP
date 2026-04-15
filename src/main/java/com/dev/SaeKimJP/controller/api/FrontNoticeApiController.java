package com.dev.SaeKimJP.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.community.FrontNoticeDetailResponse;
import com.dev.SaeKimJP.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class FrontNoticeApiController {

    private final NoticeService noticeService;

    @GetMapping("/{id}")
    public ResponseEntity<FrontNoticeDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getFrontDetailAndIncreaseViewCount(id));
    }
}