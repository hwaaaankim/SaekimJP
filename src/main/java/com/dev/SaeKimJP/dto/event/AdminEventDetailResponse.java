package com.dev.SaeKimJP.dto.event;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.event.Event;

public record AdminEventDetailResponse(
        Long id,
        String title,
        String content,
        String imageUrl,
        String linkUrl,
        boolean periodLimited,
        String startDate,
        String endDate,
        String periodText,
        String createdAtText,
        String updatedAtText,
        String manualProgressStatus,
        String resolvedProgressStatus
) {
    public static AdminEventDetailResponse from(Event event, LocalDate today, DateTimeFormatter formatter) {
        return new AdminEventDetailResponse(
                event.getId(),
                event.getTitle(),
                event.getContent(),
                event.getImageUrl(),
                event.getLinkUrl(),
                event.isPeriodLimited(),
                event.getStartDate() == null ? "" : event.getStartDate().toString(),
                event.getEndDate() == null ? "" : event.getEndDate().toString(),
                event.getPeriodText(),
                event.getCreatedAt() == null ? "" : event.getCreatedAt().format(formatter),
                event.getUpdatedAt() == null ? "" : event.getUpdatedAt().format(formatter),
                event.getManualProgressStatus().name(),
                event.resolveDisplayStatus(today).name()
        );
    }
}