package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSurgeryMiddleDto {
    private Long id;
    private String name;
    private String introText;
    private Integer displayOrder;
    private long detailCount;
    private List<AdminSurgerySimpleDetailDto> details;
}