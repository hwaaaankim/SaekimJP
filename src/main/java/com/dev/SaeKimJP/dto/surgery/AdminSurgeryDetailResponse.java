package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSurgeryDetailResponse {
    private Long id;
    private Long middleCategoryId;
    private String name;
    private String introText;
    private boolean active;
    private List<AdminSurgeryStepDetailDto> steps;
    private List<AdminSurgeryIconDetailDto> icons;
}