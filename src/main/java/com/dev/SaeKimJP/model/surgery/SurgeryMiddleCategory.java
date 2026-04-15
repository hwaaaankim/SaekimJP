package com.dev.SaeKimJP.model.surgery;

import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "surgery_middle_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurgeryMiddleCategory extends SurgeryBaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type", nullable = false, length = 30)
    private SurgeryGroupType groupType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "intro_text", nullable = false, length = 255)
    private String introText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public SurgeryMiddleCategory(SurgeryGroupType groupType, String name, String introText, Integer displayOrder) {
        this.groupType = groupType;
        this.name = name;
        this.introText = introText;
        this.displayOrder = displayOrder;
        this.active = true;
    }

    public void changeBasic(String name, String introText) {
        this.name = name;
        this.introText = introText;
    }

    public void changeOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void changeActive(boolean active) {
        this.active = active;
    }
}