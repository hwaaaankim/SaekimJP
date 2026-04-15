package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Faq;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FaqAdminListResponse {

    private Long id;
    private String title;
    private String answerPreview;
    private boolean linkEnabled;
    private String linkUrl;
    private long viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FaqAdminListResponse fromEntity(Faq faq) {
        return FaqAdminListResponse.builder()
                .id(faq.getId())
                .title(faq.getTitle())
                .answerPreview(toPreview(faq.getAnswer()))
                .linkEnabled(faq.isLinkEnabled())
                .linkUrl(faq.getLinkUrl())
                .viewCount(faq.getViewCount())
                .createdAt(faq.getCreatedAt())
                .updatedAt(faq.getUpdatedAt())
                .build();
    }

    private static String toPreview(String answer) {
        if (answer == null) {
            return "";
        }
        String normalized = answer.replace("\r\n", " ")
                                  .replace("\n", " ")
                                  .replace("\r", " ")
                                  .trim();
        if (normalized.length() <= 120) {
            return normalized;
        }
        return normalized.substring(0, 120) + "...";
    }
}