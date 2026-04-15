package com.dev.SaeKimJP.dto.surgery;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FrontSurgeryPreviewImageDto {
    private Long id;
    private String imageUrl;
    private String altText;
}