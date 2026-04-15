package com.dev.SaeKimJP.dto.community;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FaqSaveRequest {

    private String title;
    private String answer;
    private Boolean linkEnabled;
    private String linkUrl;
}