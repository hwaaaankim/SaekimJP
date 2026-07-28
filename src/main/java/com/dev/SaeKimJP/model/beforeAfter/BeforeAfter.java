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

    @Column(name = "before_front_image_url", length = 500)
    private String beforeFrontImageUrl;

    @Column(name = "before_front_image_path", length = 1000)
    private String beforeFrontImagePath;

    @Column(name = "before_front_image_original_name", length = 255)
    private String beforeFrontImageOriginalName;

    @Column(name = "before_angle45_image_url", length = 500)
    private String beforeAngle45ImageUrl;

    @Column(name = "before_angle45_image_path", length = 1000)
    private String beforeAngle45ImagePath;

    @Column(name = "before_angle45_image_original_name", length = 255)
    private String beforeAngle45ImageOriginalName;

    @Column(name = "before_angle90_image_url", length = 500)
    private String beforeAngle90ImageUrl;

    @Column(name = "before_angle90_image_path", length = 1000)
    private String beforeAngle90ImagePath;

    @Column(name = "before_angle90_image_original_name", length = 255)
    private String beforeAngle90ImageOriginalName;

    @Column(name = "after_front_image_url", length = 500)
    private String afterFrontImageUrl;

    @Column(name = "after_front_image_path", length = 1000)
    private String afterFrontImagePath;

    @Column(name = "after_front_image_original_name", length = 255)
    private String afterFrontImageOriginalName;

    @Column(name = "after_angle45_image_url", length = 500)
    private String afterAngle45ImageUrl;

    @Column(name = "after_angle45_image_path", length = 1000)
    private String afterAngle45ImagePath;

    @Column(name = "after_angle45_image_original_name", length = 255)
    private String afterAngle45ImageOriginalName;

    @Column(name = "after_angle90_image_url", length = 500)
    private String afterAngle90ImageUrl;

    @Column(name = "after_angle90_image_path", length = 1000)
    private String afterAngle90ImagePath;

    @Column(name = "after_angle90_image_original_name", length = 255)
    private String afterAngle90ImageOriginalName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
