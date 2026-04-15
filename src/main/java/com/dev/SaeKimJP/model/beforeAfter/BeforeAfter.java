package com.dev.SaeKimJP.model.beforeAfter;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterCategory;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "before_after",
    indexes = {
        @Index(name = "idx_before_after_created_at", columnList = "created_at,id"),
        @Index(name = "idx_before_after_category_created_at", columnList = "category,created_at,id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BeforeAfter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private BeforeAfterCategory category;

    @Column(name = "before_image_url", nullable = false, length = 500)
    private String beforeImageUrl;

    @Column(name = "before_image_path", nullable = false, length = 1000)
    private String beforeImagePath;

    @Column(name = "before_image_original_name", nullable = false, length = 255)
    private String beforeImageOriginalName;

    @Column(name = "after_image_url", nullable = false, length = 500)
    private String afterImageUrl;

    @Column(name = "after_image_path", nullable = false, length = 1000)
    private String afterImagePath;

    @Column(name = "after_image_original_name", nullable = false, length = 255)
    private String afterImageOriginalName;

    @Builder.Default
    @Column(name = "view_count", nullable = false)
    private Long viewCount = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}