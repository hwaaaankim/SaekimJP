package com.dev.SaeKimJP.dto.beforeAfter;

import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FrontBeforeAfterListResponse {

    private List<FrontBeforeAfterItemResponse> items;
    private long totalCount;
    private int offset;
    private int limit;
    private int nextOffset;
    private boolean hasNext;
}