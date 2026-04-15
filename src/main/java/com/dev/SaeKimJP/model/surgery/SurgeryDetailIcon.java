package com.dev.SaeKimJP.model.surgery;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "surgery_detail_icon")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SurgeryDetailIcon extends SurgeryBaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "detail_category_id", nullable = false)
    private SurgeryDetailCategory detailCategory;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "description_text", nullable = false, length = 255)
    private String descriptionText;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "image_path", nullable = false, length = 255)
    private String imagePath;

    @Column(name = "image_original_name", length = 255)
    private String imageOriginalName;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    public SurgeryDetailIcon(
            SurgeryDetailCategory detailCategory,
            String title,
            String descriptionText,
            String imageUrl,
            String imagePath,
            String imageOriginalName,
            Integer displayOrder
    ) {
        this.detailCategory = detailCategory;
        this.title = title;
        this.descriptionText = descriptionText;
        this.imageUrl = imageUrl;
        this.imagePath = imagePath;
        this.imageOriginalName = imageOriginalName;
        this.displayOrder = displayOrder;
    }

    public void changeBasic(String title, String descriptionText, Integer displayOrder) {
        this.title = title;
        this.descriptionText = descriptionText;
        this.displayOrder = displayOrder;
    }

    public void changeImage(String imageUrl, String imagePath, String imageOriginalName) {
        this.imageUrl = imageUrl;
        this.imagePath = imagePath;
        this.imageOriginalName = imageOriginalName;
    }
}