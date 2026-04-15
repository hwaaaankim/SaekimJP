package com.dev.SaeKimJP.model.community;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "tb_faq",
    indexes = {
        @Index(name = "idx_tb_faq_title", columnList = "title"),
        @Index(name = "idx_tb_faq_created_at", columnList = "created_at"),
        @Index(name = "idx_tb_faq_view_count", columnList = "view_count")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Faq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "answer", nullable = false, columnDefinition = "LONGTEXT")
    private String answer;

    @Column(name = "link_enabled", nullable = false)
    private boolean linkEnabled;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "view_count", nullable = false)
    private long viewCount;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Faq(String title, String answer, boolean linkEnabled, String linkUrl) {
        this.title = title;
        this.answer = answer;
        this.linkEnabled = linkEnabled;
        this.linkUrl = linkUrl;
        this.viewCount = 0L;
    }

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.viewCount < 0) {
            this.viewCount = 0L;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void update(String title, String answer, boolean linkEnabled, String linkUrl) {
        this.title = title;
        this.answer = answer;
        this.linkEnabled = linkEnabled;
        this.linkUrl = linkUrl;
    }

    public void increaseViewCount() {
        this.viewCount++;
    }
}