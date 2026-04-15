package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FrontSurgeryDetailDto {
    private Long id;
    private String name;
    private String introText;
    private int methodNo;
    private List<FrontSurgeryStepDto> steps;
    private List<FrontSurgeryIconDto> icons;
}