package com.dev.SaeKimJP.dto.beforeAfter;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BeforeAfterAdminListItemResponse {

    private Long id;
    private String title;
    private String description;
    private String categoryCode;
    private String categoryLabel;
    private String beforeImageUrl;
    private String afterImageUrl;
    private Long viewCount;
    private String createdAtText;
    private String updatedAtText;
}