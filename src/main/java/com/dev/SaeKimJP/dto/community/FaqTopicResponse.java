package com.dev.SaeKimJP.dto.community;

import java.time.LocalDateTime;

import com.dev.SaeKimJP.model.community.FaqTopic;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class FaqTopicResponse {

    private Long id;
    private String name;
    private int displayOrder;
    private long faqCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FaqTopicResponse fromEntity(FaqTopic topic, long faqCount) {
        return FaqTopicResponse.builder()
                .id(topic.getId())
                .name(topic.getName())
                .displayOrder(topic.getDisplayOrder())
                .faqCount(faqCount)
                .createdAt(topic.getCreatedAt())
                .updatedAt(topic.getUpdatedAt())
                .build();
    }
}
