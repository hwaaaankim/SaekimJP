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
import com.dev.SaeKimJP.repository.community.FaqRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;

    @Transactional
    public Long createFaq(FaqSaveRequest request) {
        String title = normalizeRequired(request.getTitle(), "제목");
        String answer = normalizeRequired(request.getAnswer(), "답변");
        boolean linkEnabled = Boolean.TRUE.equals(request.getLinkEnabled());
        String linkUrl = normalizeOptional(request.getLinkUrl());

        validateLink(linkEnabled, linkUrl);

        Faq faq = Faq.builder()
                .title(title)
                .answer(answer)
                .linkEnabled(linkEnabled)
                .linkUrl(linkEnabled ? linkUrl : null)
                .build();

        faqRepository.save(faq);
        return faq.getId();
    }

    public Page<FaqAdminListResponse> getAdminFaqPage(String keyword, Pageable pageable) {
        String normalizedKeyword = normalizeOptional(keyword);

        if (StringUtils.hasText(normalizedKeyword)) {
            return faqRepository.findByTitleContainingIgnoreCase(normalizedKeyword, pageable)
                    .map(FaqAdminListResponse::fromEntity);
        }

        return faqRepository.findAll(pageable)
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

        String title = normalizeRequired(request.getTitle(), "제목");
        String answer = normalizeRequired(request.getAnswer(), "답변");
        boolean linkEnabled = Boolean.TRUE.equals(request.getLinkEnabled());
        String linkUrl = normalizeOptional(request.getLinkUrl());

        validateLink(linkEnabled, linkUrl);

        faq.update(
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

    public Page<FaqFrontListResponse> getFrontFaqPage(String keyword, Pageable pageable) {
        String normalizedKeyword = normalizeOptional(keyword);

        if (StringUtils.hasText(normalizedKeyword)) {
            return faqRepository.findByTitleContainingIgnoreCase(normalizedKeyword, pageable)
                    .map(FaqFrontListResponse::fromEntity);
        }

        return faqRepository.findAll(pageable)
                .map(FaqFrontListResponse::fromEntity);
    }

    @Transactional
    public long increaseViewCount(Long faqId) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new NoSuchElementException("FAQ를 찾을 수 없습니다. id=" + faqId));

        faq.increaseViewCount();
        return faq.getViewCount();
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