package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Notice;

public record AdminNoticeListItemResponse(
    Long id,
    String title,
    Integer displayIndex,
    Long viewCount,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static AdminNoticeListItemResponse from(Notice notice) {
        return new AdminNoticeListItemResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getDisplayIndex(),
            notice.getViewCount(),
            notice.getCreatedAt(),
            notice.getUpdatedAt()
        );
    }
}