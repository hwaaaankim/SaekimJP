package com.dev.SaeKimJP.dto.event;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.enums.event.EventManualProgressStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminEventSaveRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    /**
     * 목록/카드용 요약 내용
     */
    @NotBlank(message = "내용은 필수입니다.")
    private String content;

    /**
     * 상세페이지 HTML 에디터 본문
     */
    private String detailHtml;

    private String linkUrl;

    private boolean periodLimited;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private EventManualProgressStatus manualProgressStatus = EventManualProgressStatus.ONGOING;

    private MultipartFile imageFile;
}