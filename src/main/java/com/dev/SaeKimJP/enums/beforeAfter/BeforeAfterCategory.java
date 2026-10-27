package com.dev.SaeKimJP.enums.beforeAfter;

import java.util.Arrays;

import org.springframework.util.StringUtils;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BeforeAfterCategory {

    EYE("eye", "目元"),
    YOUNG("young", "エイジングケア"),
    NOSE("nose", "鼻"),
    CONTOUR("contour", "輪郭");

    private final String code;
    private final String label;

    public static BeforeAfterCategory fromCode(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        String normalized = value.trim();

        return Arrays.stream(values())
                .filter(item ->
                        item.code.equalsIgnoreCase(normalized)
                        || item.name().equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(com.dev.SaeKimJP.util.UiLanguage.text("전후사진 분류값이 올바르지 않습니다.", "症例写真のカテゴリーが正しくありません。")));
    }

    public static BeforeAfterCategory fromFilter(String value) {
        if (!StringUtils.hasText(value) || "all".equalsIgnoreCase(value.trim())) {
            return null;
        }
        return fromCode(value);
    }

    public String getLabel() {
        return com.dev.SaeKimJP.util.UiLanguage.label(label);
    }
}
