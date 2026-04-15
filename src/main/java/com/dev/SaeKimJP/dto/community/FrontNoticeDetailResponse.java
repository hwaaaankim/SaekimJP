package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Notice;

public record FrontNoticeDetailResponse(
    Long id,
    String title,
    String content,
    Long viewCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static FrontNoticeDetailResponse from(Notice notice) {
        return new FrontNoticeDetailResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getContent(),
            notice.getViewCount(),
            notice.getCreatedAt(),
            notice.getUpdatedAt()
        );
    }
}