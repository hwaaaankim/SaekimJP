package com.dev.SaeKimJP.controller.api;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.community.AdminNoticeCreateRequest;
import com.dev.SaeKimJP.dto.community.AdminNoticeDetailResponse;
import com.dev.SaeKimJP.dto.community.AdminNoticeListItemResponse;
import com.dev.SaeKimJP.dto.community.AdminNoticeOrderUpdateRequest;
import com.dev.SaeKimJP.dto.community.AdminNoticeUpdateRequest;
import com.dev.SaeKimJP.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/notices")
public class AdminNoticeApiController {

    private final NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<AdminNoticeListItemResponse>> getList() {
        return ResponseEntity.ok(noticeService.getAdminList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminNoticeDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getAdminDetail(id));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody AdminNoticeCreateRequest request) {
        Long id = noticeService.create(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "id", id,
                "message", "공지사항이 등록되었습니다."
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id,
                                                      @RequestBody AdminNoticeUpdateRequest request) {
        noticeService.update(id, request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "공지사항이 수정되었습니다."
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "공지사항이 삭제되었습니다."
        ));
    }

    @PutMapping("/order")
    public ResponseEntity<Map<String, Object>> updateOrder(@RequestBody AdminNoticeOrderUpdateRequest request) {
        noticeService.updateOrder(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "공지사항 순서가 저장되었습니다."
        ));
    }
}