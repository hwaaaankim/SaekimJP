package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.Notice;

public record FrontNoticeListItemResponse(
    Long id,
    String title,
    LocalDateTime createdAt
) {
    public static FrontNoticeListItemResponse from(Notice notice) {
        return new FrontNoticeListItemResponse(
            notice.getId(),
            notice.getTitle(),
            notice.getCreatedAt()
        );
    }
}