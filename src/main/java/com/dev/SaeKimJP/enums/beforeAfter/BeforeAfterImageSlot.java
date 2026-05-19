package com.dev.SaeKimJP.enums.beforeAfter;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum BeforeAfterImageSlot {

    BEFORE_FRONT("before-front", "Before 정면"),
    BEFORE_ANGLE45("before-angle45", "Before 45도"),
    BEFORE_ANGLE90("before-angle90", "Before 90도"),

    AFTER_FRONT("after-front", "After 정면"),
    AFTER_ANGLE45("after-angle45", "After 45도"),
    AFTER_ANGLE90("after-angle90", "After 90도");

    private final String filePrefix;
    private final String label;
}