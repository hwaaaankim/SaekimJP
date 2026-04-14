package com.dev.SaeKimJP.model.main;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "main_banner",
    indexes = {
        @Index(name = "idx_main_banner_display_order", columnList = "display_order")
    }
)
public class MainBanner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "pc_image_url", nullable = false, length = 500)
    private String pcImageUrl;

    @Column(name = "pc_image_original_name", length = 255)
    private String pcImageOriginalName;

    @Column(name = "mobile_image_url", length = 500)
    private String mobileImageUrl;

    @Column(name = "mobile_image_original_name", length = 255)
    private String mobileImageOriginalName;

    @Column(name = "general_text", length = 255)
    private String generalText;

    @Column(name = "strong_text", length = 255)
    private String strongText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}