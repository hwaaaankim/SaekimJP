package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FrontSurgeryPageResponse {
    private String groupType;
    private String groupLabel;
    private List<String> tags;
    private List<FrontSurgeryPreviewImageDto> previewImages;
    private List<FrontSurgeryMiddleDto> middleCategories;
}