package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Notice;

public record AdminNoticeDetailResponse(
    Long id,
    String title,
    String content,
    Integer displayIndex,
    Long viewCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static AdminNoticeDetailResponse from(Notice notice) {
        return new AdminNoticeDetailResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getContent(),
            notice.getDisplayIndex(),
            notice.getViewCount(),
            notice.getCreatedAt(),
            notice.getUpdatedAt()
        );
    }
}