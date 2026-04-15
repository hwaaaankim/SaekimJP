package com.dev.SaeKimJP.dto.beforeAfter;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BeforeAfterAdminDetailResponse {

    private Long id;
    private String title;
    private String description;
    private String categoryCode;
    private String categoryLabel;

    private String beforeImageUrl;
    private String beforeImageOriginalName;

    private String afterImageUrl;
    private String afterImageOriginalName;

    private Long viewCount;
    private String createdAtText;
    private String updatedAtText;
}