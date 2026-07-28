package com.dev.SaeKimJP.dto.beforeAfter;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FrontBeforeAfterItemResponse {

    private Long id;
    private String title;
    private String description;
    private String categoryCode;
    private String categoryLabel;
    private int viewCount;

    private String beforeFrontImageUrl;
    private String beforeAngle45ImageUrl;
    private String beforeAngle90ImageUrl;

    private String afterFrontImageUrl;
    private String afterAngle45ImageUrl;
    private String afterAngle90ImageUrl;

    private String createdDateText;
}
