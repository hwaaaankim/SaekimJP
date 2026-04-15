package com.dev.SaeKimJP.dto.contact;

import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.contact.ContactInquiry;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ContactInquiryAdminDetailResponse {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private Long id;
    private String name;
    private String phone;
    private String preferredDate;
    private String preferredTime;
    private String email;
    private Boolean surgeryExperience;
    private Boolean revisionSurgery;
    private String customerMemo;
    private String adminMemo;
    private Boolean confirmed;
    private String inquiryAt;
    private String updatedAt;

    public static ContactInquiryAdminDetailResponse from(ContactInquiry entity) {
        return ContactInquiryAdminDetailResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .phone(entity.getPhone())
                .preferredDate(entity.getPreferredDate())
                .preferredTime(entity.getPreferredTime())
                .email(entity.getEmail())
                .surgeryExperience(Boolean.TRUE.equals(entity.getSurgeryExperience()))
                .revisionSurgery(Boolean.TRUE.equals(entity.getRevisionSurgery()))
                .customerMemo(entity.getCustomerMemo())
                .adminMemo(entity.getAdminMemo())
                .confirmed(Boolean.TRUE.equals(entity.getConfirmed()))
                .inquiryAt(entity.getInquiryAt() == null ? "-" : entity.getInquiryAt().format(FORMATTER))
                .updatedAt(entity.getUpdatedAt() == null ? "-" : entity.getUpdatedAt().format(FORMATTER))
                .build();
    }
}