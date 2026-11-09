package com.dev.SaeKimJP.dto.main;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
@Getter @Setter
public class AboutBannerRequest {
    private String titleText;
    private String bodyText;
    private Long version;
    private MultipartFile image;
    private boolean removeImage;
}
