package com.dev.SaeKimJP.service.faq;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.dto.community.FaqTopicResponse;
import com.dev.SaeKimJP.dto.community.FaqTopicSaveRequest;
import com.dev.SaeKimJP.model.community.FaqTopic;
import com.dev.SaeKimJP.repository.community.FaqRepository;
import com.dev.SaeKimJP.repository.community.FaqTopicRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqTopicService {

    private static final int DEFAULT_ORDER_STEP = 10;

    private final FaqTopicRepository faqTopicRepository;
    private final FaqRepository faqRepository;

    public List<FaqTopicResponse> getTopics() {
        Map<Long, Long> faqCountByTopicId = new HashMap<>();
        for (Object[] row : faqRepository.countGroupedByTopic()) {
            if (row != null && row.length >= 2 && row[0] instanceof Long topicId && row[1] instanceof Long count) {
                faqCountByTopicId.put(topicId, count);
            }
        }

        return faqTopicRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(topic -> FaqTopicResponse.fromEntity(
                        topic,
                        faqCountByTopicId.getOrDefault(topic.getId(), 0L)
                ))
                .toList();
    }

    public FaqTopic getTopicOrThrow(Long topicId) {
        if (topicId == null) {
            throw new IllegalArgumentException("FAQ 주제를 선택해주세요.");
        }

        return faqTopicRepository.findById(topicId)
                .orElseThrow(() -> new NoSuchElementException("FAQ 주제를 찾을 수 없습니다. id=" + topicId));
    }

    @Transactional
    public Long createTopic(FaqTopicSaveRequest request) {
        String name = normalizeName(request.getName());
        validateDuplicateName(name, null);

        int displayOrder = normalizeDisplayOrder(request.getDisplayOrder(), true);

        FaqTopic topic = FaqTopic.builder()
                .name(name)
                .displayOrder(displayOrder)
                .build();

        faqTopicRepository.save(topic);
        return topic.getId();
    }

    @Transactional
    public void updateTopic(Long topicId, FaqTopicSaveRequest request) {
        FaqTopic topic = faqTopicRepository.findById(topicId)
                .orElseThrow(() -> new NoSuchElementException("FAQ 주제를 찾을 수 없습니다. id=" + topicId));

        String name = normalizeName(request.getName());
        validateDuplicateName(name, topicId);

        int displayOrder = normalizeDisplayOrder(request.getDisplayOrder(), false);
        topic.update(name, displayOrder);
    }

    @Transactional
    public void deleteTopic(Long topicId) {
        FaqTopic topic = faqTopicRepository.findById(topicId)
                .orElseThrow(() -> new NoSuchElementException("FAQ 주제를 찾을 수 없습니다. id=" + topicId));

        if (faqRepository.existsByTopic_Id(topicId)) {
            throw new IllegalStateException("해당 주제를 사용 중인 FAQ가 있어 삭제할 수 없습니다. 먼저 FAQ의 주제를 변경하거나 FAQ를 삭제해주세요.");
        }

        faqTopicRepository.delete(topic);
    }

    private String normalizeName(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("주제명은 필수입니다.");
        }

        String normalized = value.trim();
        if (normalized.length() > 80) {
            throw new IllegalArgumentException("주제명은 80자 이하로 입력해주세요.");
        }
        return normalized;
    }

    private int normalizeDisplayOrder(Integer value, boolean allowAuto) {
        if (value == null && allowAuto) {
            return faqTopicRepository.findTopByOrderByDisplayOrderDescIdDesc()
                    .map(topic -> topic.getDisplayOrder() + DEFAULT_ORDER_STEP)
                    .orElse(DEFAULT_ORDER_STEP);
        }

        if (value == null) {
            throw new IllegalArgumentException("노출 순서를 입력해주세요.");
        }

        if (value < 0) {
            throw new IllegalArgumentException("노출 순서는 0 이상이어야 합니다.");
        }

        return value;
    }

    private void validateDuplicateName(String name, Long currentId) {
        faqTopicRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new IllegalArgumentException("이미 등록된 FAQ 주제명입니다.");
            }
        });
    }
}
