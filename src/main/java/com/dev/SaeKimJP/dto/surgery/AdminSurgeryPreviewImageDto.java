package com.dev.SaeKimJP.dto.surgery;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSurgeryPreviewImageDto {
    private Long id;
    private String imageUrl;
    private String altText;
    private Integer displayOrder;
    private boolean active;
}