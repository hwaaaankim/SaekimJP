package com.dev.SaeKimJP.enums.event;

public enum EventFrontFilterStatus {
    ALL,
    ONGOING,
    ENDED;

    public static EventFrontFilterStatus from(String value) {
        if (value == null || value.isBlank()) {
            return ALL;
        }

        try {
            return EventFrontFilterStatus.valueOf(value.trim().toUpperCase());
        } catch (Exception e) {
            return ALL;
        }
    }
}