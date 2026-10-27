package com.dev.SaeKimJP.enums.surgery;

public enum SurgeryGroupType {
    EYE("目元"),
    NOSE("鼻"),
    YOUNG("エイジングケア"),
    CONTOURING("輪郭");

    private final String label;

    SurgeryGroupType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return com.dev.SaeKimJP.util.UiLanguage.label(label);
    }
}