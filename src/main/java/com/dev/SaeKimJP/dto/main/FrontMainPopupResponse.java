package com.dev.SaeKimJP.dto.main;
import com.dev.SaeKimJP.model.main.MainPopup;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FrontMainPopupResponse {

    private Long id;
    private String imageUrl;
    private String linkUrl;
    private Integer displayOrder;

    public static FrontMainPopupResponse from(MainPopup entity) {
        return FrontMainPopupResponse.builder()
                .id(entity.getId())
                .imageUrl(hasText(entity.getImageUrl()) ? entity.getImageUrl() : "/front/sample/450-700.png")
                .linkUrl(entity.getLinkUrl())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}