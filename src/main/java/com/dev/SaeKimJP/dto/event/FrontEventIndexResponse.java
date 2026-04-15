package com.dev.SaeKimJP.dto.event;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import com.dev.SaeKimJP.model.event.Event;

public record FrontEventIndexResponse(
        Long id,
        String title,
        String imageUrl,
        String periodText,
        String displayStatus
) {
    public static FrontEventIndexResponse from(Event event, LocalDate today, DateTimeFormatter formatter) {
        return new FrontEventIndexResponse(
                event.getId(),
                event.getTitle(),
                event.getImageUrl(),
                event.getPeriodText(),
                event.resolveDisplayStatus(today).name().toLowerCase()
        );
    }
}