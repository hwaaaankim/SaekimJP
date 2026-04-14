package com.dev.SaeKimJP.dto.main;
import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MainPopupUpsertRequest {
    private MultipartFile image;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean useDisplayPeriod;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate displayStartDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate displayEndDate;
}