package com.dev.SaeKimJP.model.surgery;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "surgery_detail_category")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurgeryDetailCategory extends SurgeryBaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "middle_category_id", nullable = false)
    private SurgeryMiddleCategory middleCategory;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Lob
    @Column(name = "intro_text", nullable = false)
    private String introText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public SurgeryDetailCategory(
            SurgeryMiddleCategory middleCategory,
            String name,
            String introText,
            Integer displayOrder
    ) {
        this.middleCategory = middleCategory;
        this.name = name;
        this.introText = introText;
        this.displayOrder = displayOrder;
        this.active = true;
    }

    public void changeBasic(SurgeryMiddleCategory middleCategory, String name, String introText) {
        this.middleCategory = middleCategory;
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