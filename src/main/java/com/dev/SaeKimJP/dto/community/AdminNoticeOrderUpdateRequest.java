package com.dev.SaeKimJP.dto.community;

import java.util.List;

public record AdminNoticeOrderUpdateRequest(
    List<Long> noticeIds
) {
}