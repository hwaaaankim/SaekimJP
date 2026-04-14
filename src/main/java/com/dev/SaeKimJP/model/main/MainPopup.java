package com.dev.SaeKimJP.model.main;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(
    name = "main_popup",
    indexes = {
        @Index(name = "idx_main_popup_display_order", columnList = "display_order"),
        @Index(name = "idx_main_popup_period", columnList = "use_display_period, display_start_date, display_end_date")
    }
)
public class MainPopup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_original_name", length = 255)
    private String imageOriginalName;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 1;

    @Column(name = "use_display_period", nullable = false)
    private Boolean useDisplayPeriod = false;

    @Column(name = "display_start_date")
    private LocalDate displayStartDate;

    @Column(name = "display_end_date")
    private LocalDate displayEndDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}