package com.dev.SaeKimJP.controller.api;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminDetailResponse;
import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminListResponse;
import com.dev.SaeKimJP.dto.contact.ContactInquiryAdminUpdateRequest;
import com.dev.SaeKimJP.dto.contact.ContactInquiryMessageResponse;
import com.dev.SaeKimJP.service.contact.ContactInquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin/api/contactInquiries")
@RequiredArgsConstructor
public class AdminContactInquiryApiController {

    private final ContactInquiryService contactInquiryService;

    @GetMapping
    public ResponseEntity<Page<ContactInquiryAdminListResponse>> getList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String searchType,
            @RequestParam(defaultValue = "") String keyword
    ) {
        return ResponseEntity.ok(contactInquiryService.getAdminPage(searchType, keyword, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactInquiryAdminDetailResponse> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(contactInquiryService.getAdminDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactInquiryAdminDetailResponse> update(
            @PathVariable Long id,
            @RequestBody ContactInquiryAdminUpdateRequest request
    ) {
        return ResponseEntity.ok(contactInquiryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ContactInquiryMessageResponse> delete(@PathVariable Long id) {
        contactInquiryService.delete(id);
        return ResponseEntity.ok(new ContactInquiryMessageResponse("문의가 삭제되었습니다."));
    }
}