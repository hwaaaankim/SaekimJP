package com.dev.SaeKimJP.dto.main;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainBannerUpsertRequest {
    private MultipartFile pcImage;
    private MultipartFile mobileImage;
    private String generalText;
    private String strongText;
    private Integer displayOrder;
    private Boolean removeMobileImage;
}