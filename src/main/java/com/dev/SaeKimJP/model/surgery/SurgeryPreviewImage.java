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
@Table(name = "surgery_preview_image")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurgeryPreviewImage extends SurgeryBaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_type", nullable = false, length = 30)
    private SurgeryGroupType groupType;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "image_path", nullable = false, length = 255)
    private String imagePath;

    @Column(name = "image_original_name", length = 255)
    private String imageOriginalName;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public SurgeryPreviewImage(
            SurgeryGroupType groupType,
            String imageUrl,
            String imagePath,
            String imageOriginalName,
            String altText,
            Integer displayOrder
    ) {
        this.groupType = groupType;
        this.imageUrl = imageUrl;
        this.imagePath = imagePath;
        this.imageOriginalName = imageOriginalName;
        this.altText = altText;
        this.displayOrder = displayOrder;
        this.active = true;
    }

    public void changeOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public void changeImage(String imageUrl, String imagePath, String imageOriginalName) {
        this.imageUrl = imageUrl;
        this.imagePath = imagePath;
        this.imageOriginalName = imageOriginalName;
    }

    public void changeAltText(String altText) {
        this.altText = altText;
    }

    public void changeActive(boolean active) {
        this.active = active;
    }
}