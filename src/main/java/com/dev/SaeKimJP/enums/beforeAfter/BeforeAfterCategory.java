package com.dev.SaeKimJP.enums.beforeAfter;

import java.util.Arrays;

import org.springframework.util.StringUtils;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BeforeAfterCategory {

    EYE("eye", "눈"),
    YOUNG("young", "동안"),
    NOSE("nose", "코"),
    CONTOUR("contour", "윤곽");

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
                .orElseThrow(() -> new IllegalArgumentException("전후사진 분류값이 올바르지 않습니다."));
    }

    public static BeforeAfterCategory fromFilter(String value) {
        if (!StringUtils.hasText(value) || "all".equalsIgnoreCase(value.trim())) {
            return null;
        }
        return fromCode(value);
    }
}