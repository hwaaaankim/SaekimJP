package com.dev.SaeKimJP.dto.event;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.event.Event;

public record AdminEventCardResponse(
        Long id,
        String title,
        String imageUrl,
        String createdAtText,
        String updatedAtText,
        boolean periodLimited,
        String periodText,
        String manualProgressStatus,
        String resolvedProgressStatus,
        boolean hasLink
) {
    public static AdminEventCardResponse from(Event event, LocalDate today, DateTimeFormatter formatter) {
        return new AdminEventCardResponse(
                event.getId(),
                event.getTitle(),
                event.getImageUrl(),
                event.getCreatedAt() == null ? "" : event.getCreatedAt().format(formatter),
                event.getUpdatedAt() == null ? "" : event.getUpdatedAt().format(formatter),
                event.isPeriodLimited(),
                event.getPeriodText(),
                event.getManualProgressStatus().name(),
                event.resolveDisplayStatus(today).name(),
                event.hasLink()
        );
    }
}