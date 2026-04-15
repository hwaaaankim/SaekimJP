package com.dev.SaeKimJP.model.event;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.enums.event.EventManualProgressStatus;
import com.dev.SaeKimJP.enums.event.EventResolvedProgressStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tb_event")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Event {

    private static final DateTimeFormatter PERIOD_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_path", nullable = false, length = 1000)
    private String imagePath;

    @Column(name = "image_original_name", nullable = false, length = 255)
    private String imageOriginalName;

    @Column(name = "link_url", length = 1000)
    private String linkUrl;

    @Column(name = "period_limited", nullable = false)
    private boolean periodLimited;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "manual_progress_status", nullable = false, length = 20)
    private EventManualProgressStatus manualProgressStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    private Event(
            Long id,
            String title,
            String content,
            String imageUrl,
            String imagePath,
            String imageOriginalName,
            String linkUrl,
            boolean periodLimited,
            LocalDate startDate,
            LocalDate endDate,
            EventManualProgressStatus manualProgressStatus
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.imageUrl = imageUrl;
        this.imagePath = imagePath;
        this.imageOriginalName = imageOriginalName;
        this.linkUrl = normalizeNullable(linkUrl);
        this.periodLimited = periodLimited;
        this.startDate = periodLimited ? startDate : null;
        this.endDate = periodLimited ? endDate : null;
        this.manualProgressStatus = manualProgressStatus == null
                ? EventManualProgressStatus.ONGOING
                : manualProgressStatus;
    }

    public static Event create(
            String title,
            String content,
            String linkUrl,
            boolean periodLimited,
            LocalDate startDate,
            LocalDate endDate,
            EventManualProgressStatus manualProgressStatus
    ) {
        return Event.builder()
                .title(normalizeRequired(title))
                .content(normalizeRequired(content))
                .imageUrl("")
                .imagePath("")
                .imageOriginalName("")
                .linkUrl(linkUrl)
                .periodLimited(periodLimited)
                .startDate(startDate)
                .endDate(endDate)
                .manualProgressStatus(manualProgressStatus)
                .build();
    }

    public void updateBasicInfo(
            String title,
            String content,
            String linkUrl,
            boolean periodLimited,
            LocalDate startDate,
            LocalDate endDate,
            EventManualProgressStatus manualProgressStatus
    ) {
        this.title = normalizeRequired(title);
        this.content = normalizeRequired(content);
        this.linkUrl = normalizeNullable(linkUrl);
        this.periodLimited = periodLimited;
        this.startDate = periodLimited ? startDate : null;
        this.endDate = periodLimited ? endDate : null;
        this.manualProgressStatus = manualProgressStatus == null
                ? EventManualProgressStatus.ONGOING
                : manualProgressStatus;
    }

    public void replaceImage(String imageUrl, String imagePath, String imageOriginalName) {
        this.imageUrl = normalizeRequired(imageUrl);
        this.imagePath = normalizeRequired(imagePath);
        this.imageOriginalName = normalizeRequired(imageOriginalName);
    }

    public EventResolvedProgressStatus resolveDisplayStatus(LocalDate today) {
        if (this.manualProgressStatus == EventManualProgressStatus.ENDED) {
            return EventResolvedProgressStatus.ENDED;
        }

        if (this.periodLimited && this.endDate != null && this.endDate.isBefore(today)) {
            return EventResolvedProgressStatus.ENDED;
        }

        return EventResolvedProgressStatus.ONGOING;
    }

    public String getPeriodText() {
        if (!this.periodLimited) {
            return "무기한";
        }

        if (this.startDate == null || this.endDate == null) {
            return "기간 미지정";
        }

        return this.startDate.format(PERIOD_FORMATTER) + " ~ " + this.endDate.format(PERIOD_FORMATTER);
    }

    public boolean hasLink() {
        return StringUtils.hasText(this.linkUrl);
    }

    private static String normalizeRequired(String value) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        return value.trim();
    }

    private static String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}