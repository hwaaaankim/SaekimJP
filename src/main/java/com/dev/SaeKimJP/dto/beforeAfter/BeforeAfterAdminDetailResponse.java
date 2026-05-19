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

    private String beforeFrontImageUrl;
    private String beforeFrontImageOriginalName;

    private String beforeAngle45ImageUrl;
    private String beforeAngle45ImageOriginalName;

    private String beforeAngle90ImageUrl;
    private String beforeAngle90ImageOriginalName;

    private String afterFrontImageUrl;
    private String afterFrontImageOriginalName;

    private String afterAngle45ImageUrl;
    private String afterAngle45ImageOriginalName;

    private String afterAngle90ImageUrl;
    private String afterAngle90ImageOriginalName;

    private String createdAtText;
    private String updatedAtText;
}