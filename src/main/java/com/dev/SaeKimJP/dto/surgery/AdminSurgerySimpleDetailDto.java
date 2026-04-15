package com.dev.SaeKimJP.dto.surgery;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminSurgerySimpleDetailDto {
    private Long id;
    private String name;
    private Integer displayOrder;
}