package com.dev.SaeKimJP.dto.surgery;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FrontSurgeryStepDto {
    private Long id;
    private String title;
    private String descriptionText;
    private String imageUrl;
    private Integer displayOrder;
}