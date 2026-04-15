package com.dev.SaeKimJP.controller.api;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterAdminDetailResponse;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterAdminListResponse;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterCreateRequest;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterUpdateRequest;
import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.service.beforeAfter.BeforeAfterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/api/beforeAfter")
@RequiredArgsConstructor
public class AdminBeforeAfterApiController {

    private final BeforeAfterService beforeAfterService;

    @GetMapping
    public ResponseEntity<ApiResponse<BeforeAfterAdminListResponse>> getList(
            @RequestParam(name = "category", defaultValue = "all") String category,
            @RequestParam(name = "offset", defaultValue = "0") int offset,
            @RequestParam(name = "limit", defaultValue = "100") int limit
    ) {
        try {
            return ResponseEntity.ok(
                    ApiResponse.ok("전후사진 목록입니다.", beforeAfterService.getAdminList(category, offset, limit))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BeforeAfterAdminDetailResponse>> getDetail(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    ApiResponse.ok("전후사진 상세입니다.", beforeAfterService.getAdminDetail(id))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BeforeAfterAdminDetailResponse>> create(
            @ModelAttribute BeforeAfterCreateRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    ApiResponse.ok("전후사진이 등록되었습니다.", beforeAfterService.create(request))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @PostMapping(value = "/{id}/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<BeforeAfterAdminDetailResponse>> update(
            @PathVariable Long id,
            @ModelAttribute BeforeAfterUpdateRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    ApiResponse.ok("전후사진이 수정되었습니다.", beforeAfterService.update(id, request))
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            beforeAfterService.delete(id);
            return ResponseEntity.ok(ApiResponse.ok("전후사진이 삭제되었습니다.", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.fail(e.getMessage()));
        }
    }
}