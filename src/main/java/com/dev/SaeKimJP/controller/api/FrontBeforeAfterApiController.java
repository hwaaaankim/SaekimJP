package com.dev.SaeKimJP.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.beforeAfter.FrontBeforeAfterListResponse;
import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.service.beforeAfter.BeforeAfterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/beforeAfter")
@RequiredArgsConstructor
public class FrontBeforeAfterApiController {

    private final BeforeAfterService beforeAfterService;

    @GetMapping
    public ResponseEntity<ApiResponse<FrontBeforeAfterListResponse>> getList(
            @RequestParam(name = "category", defaultValue = "all") String category,
            @RequestParam(name = "offset", defaultValue = "0") int offset,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        try {
            return ResponseEntity.ok(
                    ApiResponse.ok("전후사진 목록입니다.", beforeAfterService.getFrontList(category, offset, limit))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}