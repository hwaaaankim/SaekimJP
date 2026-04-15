package com.dev.SaeKimJP.enums.surgery;

public enum SurgeryGroupType {
    EYE("눈"),
    NOSE("코"),
    YOUNG("동안"),
    CONTOURING("윤곽");

    private final String label;

    SurgeryGroupType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}