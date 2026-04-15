package com.dev.SaeKimJP.dto.contact;

import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.contact.ContactInquiry;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContactInquiryAdminListResponse {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long id;
    private String name;
    private String phone;
    private String inquiryAt;
    private String updatedAt;
    private Boolean confirmed;

    public static ContactInquiryAdminListResponse from(ContactInquiry entity) {
        return ContactInquiryAdminListResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .inquiryAt(entity.getInquiryAt() == null ? "-" : entity.getInquiryAt().format(FORMATTER))
                .updatedAt(entity.getUpdatedAt() == null ? "-" : entity.getUpdatedAt().format(FORMATTER))
                .confirmed(Boolean.TRUE.equals(entity.getConfirmed()))
                .build();
    }
}