package com.dev.SaeKimJP.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dev.SaeKimJP.dto.contact.ContactInquiryCreateRequest;
import com.dev.SaeKimJP.dto.contact.ContactInquiryCreateResponse;
import com.dev.SaeKimJP.service.contact.ContactInquiryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ContactInquiryApiController {

    private final ContactInquiryService contactInquiryService;

    @PostMapping("/api/contact")
    public ResponseEntity<ContactInquiryCreateResponse> create(@RequestBody ContactInquiryCreateRequest request) {
        return ResponseEntity.ok(contactInquiryService.create(request));
    }
}