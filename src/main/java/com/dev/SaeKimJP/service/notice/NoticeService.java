package com.dev.SaeKimJP.service.notice;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.dto.community.AdminNoticeCreateRequest;
import com.dev.SaeKimJP.dto.community.AdminNoticeDetailResponse;
import com.dev.SaeKimJP.dto.community.AdminNoticeListItemResponse;
import com.dev.SaeKimJP.dto.community.AdminNoticeOrderUpdateRequest;
import com.dev.SaeKimJP.dto.community.AdminNoticeUpdateRequest;
import com.dev.SaeKimJP.dto.community.FrontNoticeDetailResponse;
import com.dev.SaeKimJP.dto.community.FrontNoticeListItemResponse;
import com.dev.SaeKimJP.model.community.Notice;
import com.dev.SaeKimJP.repository.community.NoticeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NoticeService {

    private static final int FRONT_PAGE_SIZE = 10;

    private final NoticeRepository noticeRepository;

    public List<AdminNoticeListItemResponse> getAdminList() {
        return noticeRepository.findAllForAdmin()
                .stream()
                .map(AdminNoticeListItemResponse::from)
                .toList();
    }

    public AdminNoticeDetailResponse getAdminDetail(Long id) {
        Notice notice = getNoticeOrThrow(id);
        return AdminNoticeDetailResponse.from(notice);
    }

    @Transactional
    public Long create(AdminNoticeCreateRequest request) {
        String title = normalizeTitle(request.title());
        String content = normalizeContent(request.content());

        Integer maxDisplayIndex = noticeRepository.findMaxDisplayIndex();
        int nextDisplayIndex = (maxDisplayIndex == null ? 0 : maxDisplayIndex) + 1;

        Notice notice = Notice.builder()
                .title(title)
                .content(content)
                .displayIndex(nextDisplayIndex)
                .viewCount(0L)
                .build();

        return noticeRepository.save(notice).getId();
    }

    @Transactional
    public void update(Long id, AdminNoticeUpdateRequest request) {
        Notice notice = getNoticeOrThrow(id);

        String title = normalizeTitle(request.title());
        String content = normalizeContent(request.content());

        notice.update(title, content);
    }

    @Transactional
    public void delete(Long id) {
        Notice notice = getNoticeOrThrow(id);
        noticeRepository.delete(notice);

        List<Notice> remainList = new ArrayList<>(noticeRepository.findAllByOrderByDisplayIndexAscIdDesc());
        resequence(remainList);
    }

    @Transactional
    public void updateOrder(AdminNoticeOrderUpdateRequest request) {
        List<Long> requestedIds = request.noticeIds();
        if (requestedIds == null || requestedIds.isEmpty()) {
            throw new IllegalArgumentException("순서 저장 대상이 없습니다.");
        }

        List<Notice> currentList = noticeRepository.findAllByOrderByDisplayIndexAscIdDesc();
        if (currentList.size() != requestedIds.size()) {
            throw new IllegalArgumentException("공지사항 개수가 일치하지 않습니다.");
        }

        Map<Long, Notice> noticeMap = new HashMap<>();
        for (Notice notice : currentList) {
            noticeMap.put(notice.getId(), notice);
        }

        for (Long requestedId : requestedIds) {
            if (!noticeMap.containsKey(requestedId)) {
                throw new IllegalArgumentException("존재하지 않는 공지사항이 포함되어 있습니다. id=" + requestedId);
            }
        }

        for (int i = 0; i < requestedIds.size(); i++) {
            Notice notice = noticeMap.get(requestedIds.get(i));
            notice.updateDisplayIndex(i + 1);
        }
    }

    public Page<FrontNoticeListItemResponse> getFrontPage(String keyword, int page) {
        int safePage = Math.max(page, 1);
        PageRequest pageable = PageRequest.of(safePage - 1, FRONT_PAGE_SIZE);

        return noticeRepository.searchByTitle(
                    keyword == null ? "" : keyword.trim(),
                    pageable
                )
                .map(FrontNoticeListItemResponse::from);
    }

    @Transactional
    public FrontNoticeDetailResponse getFrontDetailAndIncreaseViewCount(Long id) {
        Notice notice = getNoticeOrThrow(id);
        notice.increaseViewCount();
        return FrontNoticeDetailResponse.from(notice);
    }

    private Notice getNoticeOrThrow(Long id) {
        return noticeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("공지사항을 찾을 수 없습니다. id=" + id));
    }

    private void resequence(List<Notice> notices) {
        notices.sort(Comparator
                .comparing(Notice::getDisplayIndex, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(Notice::getId));

        for (int i = 0; i < notices.size(); i++) {
            notices.get(i).updateDisplayIndex(i + 1);
        }
    }

    private String normalizeTitle(String title) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }
        return title.trim();
    }

    private String normalizeContent(String content) {
        if (!StringUtils.hasText(content) || isEditorContentEmpty(content)) {
            throw new IllegalArgumentException("내용은 필수입니다.");
        }
        return content;
    }

    private boolean isEditorContentEmpty(String content) {
        if (content == null) {
            return true;
        }

        String plain = content
                .replaceAll("(?i)<br\\s*/?>", "")
                .replaceAll("(?i)</p>", "")
                .replaceAll("(?i)<p>", "")
                .replace("&nbsp;", "")
                .replaceAll("<[^>]*>", "")
                .trim();

        return !StringUtils.hasText(plain);
    }
}