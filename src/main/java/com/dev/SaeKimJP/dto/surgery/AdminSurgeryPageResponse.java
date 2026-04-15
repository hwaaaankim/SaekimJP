package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSurgeryPageResponse {
    private String groupType;
    private String groupLabel;
    private List<AdminSurgeryPreviewImageDto> previewImages;
    private List<AdminSurgeryMiddleDto> middleCategories;
}