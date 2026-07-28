package com.dev.SaeKimJP.dto.beforeAfter;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BeforeAfterUpdateRequest {

    private String title;
    private String description;
    private String category;

    private MultipartFile beforeFrontImageFile;
    private MultipartFile beforeAngle45ImageFile;
    private MultipartFile beforeAngle90ImageFile;

    private MultipartFile afterFrontImageFile;
    private MultipartFile afterAngle45ImageFile;
    private MultipartFile afterAngle90ImageFile;

    private boolean removeFrontView;
    private boolean removeAngle45View;
    private boolean removeAngle90View;
}
