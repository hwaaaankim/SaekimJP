package com.dev.SaeKimJP.dto.event;

import java.util.List;

public record FrontEventCursorResponse(
        List<FrontEventListItemResponse> items,
        long totalCount,
        boolean hasNext,
        Long nextCursor
) {
}