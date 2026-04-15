package com.dev.SaeKimJP.dto.event;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.event.Event;

public record FrontEventListItemResponse(
        Long id,
        String title,
        String content,
        String imageUrl,
        String linkUrl,
        boolean hasLink,
        boolean periodLimited,
        String periodText,
        String createdAtText,
        String updatedAtText,
        String displayStatus
) {
    public static FrontEventListItemResponse from(Event event, LocalDate today, DateTimeFormatter formatter) {
        return new FrontEventListItemResponse(
                event.getId(),
                event.getTitle(),
                event.getContent(),
                event.getImageUrl(),
                event.getLinkUrl(),
                event.hasLink(),
                event.isPeriodLimited(),
                event.getPeriodText(),
                event.getCreatedAt() == null ? "" : event.getCreatedAt().format(formatter),
                event.getUpdatedAt() == null ? "" : event.getUpdatedAt().format(formatter),
                event.resolveDisplayStatus(today).name().toLowerCase()
        );
    }
}