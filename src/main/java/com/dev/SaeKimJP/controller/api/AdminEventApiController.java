package com.dev.SaeKimJP.controller.api;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.common.ApiResponse;
import com.dev.SaeKimJP.dto.event.AdminEventCardResponse;
import com.dev.SaeKimJP.dto.event.AdminEventDetailResponse;
import com.dev.SaeKimJP.dto.event.AdminEventSaveRequest;
import com.dev.SaeKimJP.service.event.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/api/events")
@RequiredArgsConstructor
public class AdminEventApiController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<AdminEventCardResponse>> getList() {
        return ResponseEntity.ok(eventService.getAdminEventList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminEventDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getAdminEventDetail(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AdminEventDetailResponse>> create(
            @ModelAttribute AdminEventSaveRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("이벤트가 등록되었습니다.", eventService.createEvent(request)));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AdminEventDetailResponse>> update(
            @PathVariable Long id,
            @ModelAttribute AdminEventSaveRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("이벤트가 수정되었습니다.", eventService.updateEvent(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(ApiResponse.ok("이벤트가 삭제되었습니다.", null));
    }
}