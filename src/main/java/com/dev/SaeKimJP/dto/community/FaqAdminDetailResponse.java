package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Faq;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FaqAdminDetailResponse {

    private Long id;
    private String title;
    private String answer;
    private boolean linkEnabled;
    private String linkUrl;
    private long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FaqAdminDetailResponse fromEntity(Faq faq) {
        return FaqAdminDetailResponse.builder()
                .id(faq.getId())
                .title(faq.getTitle())
                .answer(faq.getAnswer())
                .linkEnabled(faq.isLinkEnabled())
                .linkUrl(faq.getLinkUrl())
                .viewCount(faq.getViewCount())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .build();
    }
}