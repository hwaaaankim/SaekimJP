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

    private MultipartFile beforeImageFile;
    private MultipartFile afterImageFile;
}