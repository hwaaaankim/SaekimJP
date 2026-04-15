package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FrontSurgeryMiddleDto {
    private Long id;
    private String name;
    private String introText;
    private List<FrontSurgeryDetailDto> details;
}