package com.dev.SaeKimJP.dto.main;
import com.dev.SaeKimJP.model.main.MainBanner;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MainBannerAdminResponse {

    private Long id;
    private String pcImageUrl;
    private String mobileImageUrl;
    private String generalText;
    private String strongText;
    private Integer displayOrder;

    public static MainBannerAdminResponse from(MainBanner entity) {
        String resolvedPc = hasText(entity.getPcImageUrl()) ? entity.getPcImageUrl() : "/front/sample/1920-970.png";
        String resolvedMobile = hasText(entity.getMobileImageUrl()) ? entity.getMobileImageUrl() : resolvedPc;

        return MainBannerAdminResponse.builder()
                .id(entity.getId())
                .pcImageUrl(resolvedPc)
                .mobileImageUrl(resolvedMobile)
                .generalText(entity.getGeneralText())
                .strongText(entity.getStrongText())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}