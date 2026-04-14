package com.dev.SaeKimJP.dto.main;
import com.dev.SaeKimJP.model.main.MainBanner;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FrontMainBannerResponse {

    private Long id;
    private String pcImageUrl;
    private String mobileImageUrl;
    private String generalText;
    private String strongText;
    private Integer displayOrder;

    public static FrontMainBannerResponse from(MainBanner entity) {
        String resolvedPc = hasText(entity.getPcImageUrl()) ? entity.getPcImageUrl() : "/front/sample/1920-970.png";
        String resolvedMobile = hasText(entity.getMobileImageUrl()) ? entity.getMobileImageUrl() : resolvedPc;

        return FrontMainBannerResponse.builder()
                .id(entity.getId())
                .pcImageUrl(resolvedPc)
                .mobileImageUrl(resolvedMobile)
                .generalText(hasText(entity.getGeneralText()) ? entity.getGeneralText() : "TITLE MESSAGE AREA,")
                .strongText(hasText(entity.getStrongText()) ? entity.getStrongText() : "STRONG TEXT")
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    public static FrontMainBannerResponse fallback() {
        return FrontMainBannerResponse.builder()
                .id(0L)
                .pcImageUrl("/front/sample/1920-970.png")
                .mobileImageUrl("/front/sample/1920-970.png")
                .generalText("TITLE MESSAGE AREA,")
                .strongText("STRONG TEXT")
                .displayOrder(1)
                .build();
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}