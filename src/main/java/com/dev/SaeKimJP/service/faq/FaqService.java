package com.dev.SaeKimJP.service.faq;

import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.dto.community.FaqAdminDetailResponse;
import com.dev.SaeKimJP.dto.community.FaqAdminListResponse;
import com.dev.SaeKimJP.dto.community.FaqFrontListResponse;
import com.dev.SaeKimJP.dto.community.FaqSaveRequest;
import com.dev.SaeKimJP.model.community.Faq;
import com.dev.SaeKimJP.model.community.FaqTopic;
import com.dev.SaeKimJP.repository.community.FaqRepository;
import com.dev.SaeKimJP.util.FrontPagePathUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqTopicService faqTopicService;

    @Transactional
    public Long createFaq(FaqSaveRequest request) {
        FaqTopic topic = faqTopicService.getTopicOrThrow(request.getTopicId());
        String title = normalizeRequired(request.getTitle(), "제목");
        String answer = normalizeRequired(request.getAnswer(), "답변");
        boolean linkEnabled = Boolean.TRUE.equals(request.getLinkEnabled());
        String linkUrl = FrontPagePathUtils.normalizeInternalPagePath(request.getLinkUrl());

        validateLink(linkEnabled, linkUrl);

        Faq faq = Faq.builder()
                .topic(topic)
                .title(title)
                .answer(answer)
                .linkEnabled(linkEnabled)
                .linkUrl(linkEnabled ? linkUrl : null)
                .build();

        faqRepository.save(faq);
        return faq.getId();
    }

    public Page<FaqAdminListResponse> getAdminFaqPage(String keyword, Long topicId, Pageable pageable) {
        return getFaqPage(keyword, topicId, pageable)
                .map(FaqAdminListResponse::fromEntity);
    }

    public FaqAdminDetailResponse getAdminFaqDetail(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new NoSuchElementException("FAQ를 찾을 수 없습니다. id=" + faqId));

        return FaqAdminDetailResponse.fromEntity(faq);
    }

    @Transactional
    public void updateFaq(Long faqId, FaqSaveRequest request) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new NoSuchElementException("FAQ를 찾을 수 없습니다. id=" + faqId));

        FaqTopic topic = faqTopicService.getTopicOrThrow(request.getTopicId());
        String title = normalizeRequired(request.getTitle(), "제목");
        String answer = normalizeRequired(request.getAnswer(), "답변");
        boolean linkEnabled = Boolean.TRUE.equals(request.getLinkEnabled());
        String linkUrl = FrontPagePathUtils.normalizeInternalPagePath(request.getLinkUrl());

        validateLink(linkEnabled, linkUrl);

        faq.update(
                topic,
                title,
                answer,
                linkEnabled,
                linkEnabled ? linkUrl : null
        );
    }

    @Transactional
    public void deleteFaq(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new NoSuchElementException("FAQ를 찾을 수 없습니다. id=" + faqId));

        faqRepository.delete(faq);
    }

    public Page<FaqFrontListResponse> getFrontFaqPage(String keyword, Long topicId, Pageable pageable) {
        return getFaqPage(keyword, topicId, pageable)
                .map(FaqFrontListResponse::fromEntity);
    }

    @Transactional
    public long increaseViewCount(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new NoSuchElementException("FAQ를 찾을 수 없습니다. id=" + faqId));

        faq.increaseViewCount();
        return faq.getViewCount();
    }

    private Page<Faq> getFaqPage(String keyword, Long topicId, Pageable pageable) {
        String normalizedKeyword = normalizeOptional(keyword);
        boolean hasKeyword = StringUtils.hasText(normalizedKeyword);
        boolean hasTopic = topicId != null;

        if (hasTopic && hasKeyword) {
            return faqRepository.findByTopic_IdAndTitleContainingIgnoreCase(topicId, normalizedKeyword, pageable);
        }
        if (hasTopic) {
            return faqRepository.findByTopic_Id(topicId, pageable);
        }
        if (hasKeyword) {
            return faqRepository.findByTitleContainingIgnoreCase(normalizedKeyword, pageable);
        }
        return faqRepository.findAll(pageable);
    }

    private String normalizeRequired(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException(fieldName + "은(는) 필수입니다.");
        }
        return value.trim();
    }

    private String normalizeOptional(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private void validateLink(boolean linkEnabled, String linkUrl) {
        if (linkEnabled && !StringUtils.hasText(linkUrl)) {
            throw new IllegalArgumentException("링크 사용이 활성화된 경우 링크를 반드시 입력해야 합니다.");
        }
    }
}
