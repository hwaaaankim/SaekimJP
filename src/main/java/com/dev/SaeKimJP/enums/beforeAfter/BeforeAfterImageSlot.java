package com.dev.SaeKimJP.enums.beforeAfter;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BeforeAfterImageSlot {

    BEFORE_FRONT("before-front", "Before 正面"),
    BEFORE_ANGLE45("before-angle45", "Before 45度"),
    BEFORE_ANGLE90("before-angle90", "Before 90度"),

    AFTER_FRONT("after-front", "After 正面"),
    AFTER_ANGLE45("after-angle45", "After 45度"),
    AFTER_ANGLE90("after-angle90", "After 90度");

    private final String filePrefix;
    private final String label;

    public String getLabel() {
        return com.dev.SaeKimJP.util.UiLanguage.label(label);
    }
}
