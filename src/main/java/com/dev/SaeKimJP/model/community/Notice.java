package com.dev.SaeKimJP.model.community;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "tb_notice",
    indexes = {
        @Index(name = "idx_notice_title", columnList = "title"),
        @Index(name = "idx_notice_display_index", columnList = "display_index"),
        @Index(name = "idx_notice_created_at", columnList = "created_at")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(name = "display_index", nullable = false)
    private Integer displayIndex;

    @Column(name = "view_count", nullable = false)
    private Long viewCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Notice(String title, String content, Integer displayIndex, Long viewCount) {
        this.title = title;
        this.content = content;
        this.displayIndex = displayIndex;
        this.viewCount = viewCount == null ? 0L : viewCount;
    }

    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    public void updateDisplayIndex(Integer displayIndex) {
        this.displayIndex = displayIndex;
    }

    public void increaseViewCount() {
        if (this.viewCount == null) {
            this.viewCount = 0L;
        }
        this.viewCount++;
    }
}