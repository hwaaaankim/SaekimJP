package com.dev.SaeKimJP.dto.main;
import lombok.AllArgsConstructor;
import lombok.Getter;
@Getter @AllArgsConstructor
public class AboutBannerResponse {
    private String titleText;
    private String bodyText;
    private String imageUrl;
    private String imageOriginalName;
    private boolean customImage;
    private Long version;
}
