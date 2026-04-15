package com.dev.SaeKimJP.controller.api;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.dev.SaeKimJP.dto.surgery.AdminSurgeryDetailResponse;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryPageResponse;
import com.dev.SaeKimJP.dto.surgery.SurgeryDetailUpsertRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryIdOrderRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryMiddleCreateRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryMiddleUpdateRequest;
import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.service.surgery.SurgeryAdminService;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/api/surgery")
@RequiredArgsConstructor
@Validated
public class AdminSurgeryApiController {

    private final SurgeryAdminService surgeryAdminService;
    private final ObjectMapper objectMapper;

    @GetMapping("/{groupType}/page-data")
    public ResponseEntity<AdminSurgeryPageResponse> getPageData(@PathVariable SurgeryGroupType groupType) {
        return ResponseEntity.ok(surgeryAdminService.getAdminPageData(groupType));
    }

    @PostMapping(value = "/{groupType}/preview-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPreviewImages(
            @PathVariable SurgeryGroupType groupType,
            @RequestPart("files") List<MultipartFile> files
    ) {
        surgeryAdminService.createPreviewImages(groupType, files);
        return ResponseEntity.ok(Map.of("message", "미리보기 이미지가 등록되었습니다."));
    }

    @DeleteMapping("/preview-images/{previewImageId}")
    public ResponseEntity<?> deletePreviewImage(@PathVariable Long previewImageId) {
        surgeryAdminService.deletePreviewImage(previewImageId);
        return ResponseEntity.ok(Map.of("message", "미리보기 이미지가 삭제되었습니다."));
    }

    @PostMapping("/{groupType}/preview-images/reorder")
    public ResponseEntity<?> reorderPreviewImages(
            @PathVariable SurgeryGroupType groupType,
            @RequestBody @Valid SurgeryIdOrderRequest request
    ) {
        surgeryAdminService.reorderPreviewImages(groupType, request.getIds());
        return ResponseEntity.ok(Map.of("message", "미리보기 이미지 순서가 저장되었습니다."));
    }

    @PostMapping("/{groupType}/middles")
    public ResponseEntity<?> createMiddle(
            @PathVariable SurgeryGroupType groupType,
            @RequestBody @Valid SurgeryMiddleCreateRequest request
    ) {
        surgeryAdminService.createMiddleCategory(groupType, request);
        return ResponseEntity.ok(Map.of("message", "중분류가 등록되었습니다."));
    }

    @PutMapping("/middles/{middleCategoryId}")
    public ResponseEntity<?> updateMiddle(
            @PathVariable Long middleCategoryId,
            @RequestBody @Valid SurgeryMiddleUpdateRequest request
    ) {
        surgeryAdminService.updateMiddleCategory(middleCategoryId, request);
        return ResponseEntity.ok(Map.of("message", "중분류가 수정되었습니다."));
    }

    @DeleteMapping("/middles/{middleCategoryId}")
    public ResponseEntity<?> deleteMiddle(@PathVariable Long middleCategoryId) {
        surgeryAdminService.deleteMiddleCategory(middleCategoryId);
        return ResponseEntity.ok(Map.of("message", "중분류가 삭제되었습니다."));
    }

    @PostMapping("/{groupType}/middles/reorder")
    public ResponseEntity<?> reorderMiddles(
            @PathVariable SurgeryGroupType groupType,
            @RequestBody @Valid SurgeryIdOrderRequest request
    ) {
        surgeryAdminService.reorderMiddleCategories(groupType, request.getIds());
        return ResponseEntity.ok(Map.of("message", "중분류 순서가 저장되었습니다."));
    }

    @GetMapping("/details/{detailId}")
    public ResponseEntity<AdminSurgeryDetailResponse> getDetail(@PathVariable Long detailId) {
        return ResponseEntity.ok(surgeryAdminService.getDetail(detailId));
    }

    @PostMapping(value = "/{groupType}/details", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createDetail(
            @PathVariable SurgeryGroupType groupType,
            @RequestPart("payload") String payload,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        SurgeryDetailUpsertRequest request = objectMapper.readValue(payload, SurgeryDetailUpsertRequest.class);
        surgeryAdminService.createDetail(groupType, request, multipartRequest);
        return ResponseEntity.ok(Map.of("message", "소분류가 등록되었습니다."));
    }

    @PutMapping(value = "/{groupType}/details/{detailId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateDetail(
            @PathVariable SurgeryGroupType groupType,
            @PathVariable Long detailId,
            @RequestPart("payload") String payload,
            MultipartHttpServletRequest multipartRequest
    ) throws IOException {
        SurgeryDetailUpsertRequest request = objectMapper.readValue(payload, SurgeryDetailUpsertRequest.class);
        surgeryAdminService.updateDetail(groupType, detailId, request, multipartRequest);
        return ResponseEntity.ok(Map.of("message", "소분류가 수정되었습니다."));
    }

    @DeleteMapping("/details/{detailId}")
    public ResponseEntity<?> deleteDetail(@PathVariable Long detailId) {
        surgeryAdminService.deleteDetail(detailId);
        return ResponseEntity.ok(Map.of("message", "소분류가 삭제되었습니다."));
    }

    @PostMapping("/middles/{middleCategoryId}/details/reorder")
    public ResponseEntity<?> reorderDetails(
            @PathVariable Long middleCategoryId,
            @RequestBody @Valid SurgeryIdOrderRequest request
    ) {
        surgeryAdminService.reorderDetails(middleCategoryId, request.getIds());
        return ResponseEntity.ok(Map.of("message", "소분류 순서가 저장되었습니다."));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}