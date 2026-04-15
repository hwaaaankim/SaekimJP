package com.dev.SaeKimJP.dto.surgery;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SurgeryDetailItemRequest {

    private Long id;
    private String clientKey;
    private String title;
    private String descriptionText;
    private Integer displayOrder;
    private Boolean deleted;
}