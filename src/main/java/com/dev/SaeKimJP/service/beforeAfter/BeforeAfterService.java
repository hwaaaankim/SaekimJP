package com.dev.SaeKimJP.service.beforeAfter;

import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterAdminDetailResponse;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterAdminListItemResponse;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterAdminListResponse;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterCreateRequest;
import com.dev.SaeKimJP.dto.beforeAfter.BeforeAfterUpdateRequest;
import com.dev.SaeKimJP.dto.beforeAfter.FrontBeforeAfterItemResponse;
import com.dev.SaeKimJP.dto.beforeAfter.FrontBeforeAfterListResponse;
import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterCategory;
import com.dev.SaeKimJP.model.beforeAfter.BeforeAfter;
import com.dev.SaeKimJP.repository.beforeAfter.BeforeAfterRepository;
import com.dev.SaeKimJP.service.beforeAfter.BeforeAfterFileStoreService.StoredFileInfo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BeforeAfterService {

    private final BeforeAfterRepository beforeAfterRepository;
    private final BeforeAfterFileStoreService beforeAfterFileStoreService;

    private static final DateTimeFormatter ADMIN_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");
    private static final DateTimeFormatter FRONT_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    public BeforeAfterAdminListResponse getAdminList(String category, int offset, int limit) {
        BeforeAfterCategory parsedCategory = BeforeAfterCategory.fromFilter(category);
        int safeOffset = Math.max(offset, 0);
        int safeLimit = Math.max(limit, 1);

        List<BeforeAfter> items = beforeAfterRepository.findList(parsedCategory, safeOffset, safeLimit);
        long totalCount = beforeAfterRepository.countList(parsedCategory);

        List<BeforeAfterAdminListItemResponse> responseItems = items.stream()
                .map(this::toAdminListItemResponse)
                .toList();

        int nextOffset = safeOffset + responseItems.size();
        boolean hasNext = nextOffset < totalCount;

        return BeforeAfterAdminListResponse.builder()
                .items(responseItems)
                .totalCount(totalCount)
                .offset(safeOffset)
                .limit(safeLimit)
                .nextOffset(nextOffset)
                .hasNext(hasNext)
                .build();
    }

    public BeforeAfterAdminDetailResponse getAdminDetail(Long id) {
        BeforeAfter entity = getEntity(id);
        return toAdminDetailResponse(entity);
    }

    public FrontBeforeAfterListResponse getFrontList(String category, int offset, int limit) {
        BeforeAfterCategory parsedCategory = BeforeAfterCategory.fromFilter(category);
        int safeOffset = Math.max(offset, 0);
        int safeLimit = Math.max(limit, 1);

        List<BeforeAfter> items = beforeAfterRepository.findList(parsedCategory, safeOffset, safeLimit);
        long totalCount = beforeAfterRepository.countList(parsedCategory);

        List<FrontBeforeAfterItemResponse> responseItems = items.stream()
                .map(this::toFrontItemResponse)
                .toList();

        int nextOffset = safeOffset + responseItems.size();
        boolean hasNext = nextOffset < totalCount;

        return FrontBeforeAfterListResponse.builder()
                .items(responseItems)
                .totalCount(totalCount)
                .offset(safeOffset)
                .limit(safeLimit)
                .nextOffset(nextOffset)
                .hasNext(hasNext)
                .build();
    }

    @Transactional
    public BeforeAfterAdminDetailResponse create(BeforeAfterCreateRequest request) {
        validateCommonFields(request.getTitle(), request.getDescription(), request.getCategory());

        if (!hasFile(request.getBeforeImageFile())) {
            throw new IllegalArgumentException("Before 이미지는 필수입니다.");
        }

        if (!hasFile(request.getAfterImageFile())) {
            throw new IllegalArgumentException("After 이미지는 필수입니다.");
        }

        BeforeAfter entity = BeforeAfter.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(BeforeAfterCategory.fromCode(request.getCategory()))
                .beforeImageUrl("")
                .beforeImagePath("")
                .beforeImageOriginalName("")
                .afterImageUrl("")
                .afterImagePath("")
                .afterImageOriginalName("")
                .viewCount(0L)
                .build();

        beforeAfterRepository.save(entity);

        try {
            applyBeforeImage(entity, request.getBeforeImageFile());
            applyAfterImage(entity, request.getAfterImageFile());
            beforeAfterRepository.save(entity);
            return toAdminDetailResponse(entity);
        } catch (RuntimeException e) {
            beforeAfterFileStoreService.deleteQuietly(entity.getBeforeImagePath());
            beforeAfterFileStoreService.deleteQuietly(entity.getAfterImagePath());
            beforeAfterRepository.delete(entity);
            throw e;
        }
    }

    @Transactional
    public BeforeAfterAdminDetailResponse update(Long id, BeforeAfterUpdateRequest request) {
        validateCommonFields(request.getTitle(), request.getDescription(), request.getCategory());

        BeforeAfter entity = getEntity(id);

        entity.setTitle(request.getTitle().trim());
        entity.setDescription(request.getDescription().trim());
        entity.setCategory(BeforeAfterCategory.fromCode(request.getCategory()));

        if (hasFile(request.getBeforeImageFile())) {
            replaceBeforeImage(entity, request.getBeforeImageFile());
        }

        if (hasFile(request.getAfterImageFile())) {
            replaceAfterImage(entity, request.getAfterImageFile());
        }

        return toAdminDetailResponse(entity);
    }

    @Transactional
    public void delete(Long id) {
        BeforeAfter entity = getEntity(id);

        String beforeImagePath = entity.getBeforeImagePath();
        String afterImagePath = entity.getAfterImagePath();

        beforeAfterRepository.delete(entity);

        beforeAfterFileStoreService.deleteQuietly(beforeImagePath);
        beforeAfterFileStoreService.deleteQuietly(afterImagePath);
    }

    private void replaceBeforeImage(BeforeAfter entity, MultipartFile file) {
        String oldPath = entity.getBeforeImagePath();
        applyBeforeImage(entity, file);
        beforeAfterFileStoreService.deleteQuietly(oldPath);
    }

    private void replaceAfterImage(BeforeAfter entity, MultipartFile file) {
        String oldPath = entity.getAfterImagePath();
        applyAfterImage(entity, file);
        beforeAfterFileStoreService.deleteQuietly(oldPath);
    }

    private void applyBeforeImage(BeforeAfter entity, MultipartFile file) {
        StoredFileInfo storedFileInfo = beforeAfterFileStoreService.store(entity.getId(), file, "before");
        entity.setBeforeImageOriginalName(storedFileInfo.getOriginalFilename());
        entity.setBeforeImagePath(storedFileInfo.getFullPath());
        entity.setBeforeImageUrl(storedFileInfo.getUrl());
    }

    private void applyAfterImage(BeforeAfter entity, MultipartFile file) {
        StoredFileInfo storedFileInfo = beforeAfterFileStoreService.store(entity.getId(), file, "after");
        entity.setAfterImageOriginalName(storedFileInfo.getOriginalFilename());
        entity.setAfterImagePath(storedFileInfo.getFullPath());
        entity.setAfterImageUrl(storedFileInfo.getUrl());
    }

    private BeforeAfter getEntity(Long id) {
        return beforeAfterRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("전후사진 데이터를 찾을 수 없습니다."));
    }

    private void validateCommonFields(String title, String description, String category) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("수술명을 입력해 주세요.");
        }

        if (!StringUtils.hasText(description)) {
            throw new IllegalArgumentException("간단한 설명문구를 입력해 주세요.");
        }

        if (title.trim().length() > 150) {
            throw new IllegalArgumentException("수술명은 150자 이내로 입력해 주세요.");
        }

        if (description.trim().length() > 500) {
            throw new IllegalArgumentException("간단한 설명문구는 500자 이내로 입력해 주세요.");
        }

        BeforeAfterCategory.fromCode(category);
    }

    private boolean hasFile(MultipartFile file) {
        return file != null && !file.isEmpty();
    }

    private BeforeAfterAdminListItemResponse toAdminListItemResponse(BeforeAfter entity) {
        return BeforeAfterAdminListItemResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())
                .beforeImageUrl(entity.getBeforeImageUrl())
                .afterImageUrl(entity.getAfterImageUrl())
                .viewCount(entity.getViewCount())
                .createdAtText(entity.getCreatedAt() == null ? "-" : entity.getCreatedAt().format(ADMIN_DATE_TIME_FORMATTER))
                .updatedAtText(entity.getUpdatedAt() == null ? "-" : entity.getUpdatedAt().format(ADMIN_DATE_TIME_FORMATTER))
                .build();
    }

    private BeforeAfterAdminDetailResponse toAdminDetailResponse(BeforeAfter entity) {
        return BeforeAfterAdminDetailResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())
                .beforeImageUrl(entity.getBeforeImageUrl())
                .beforeImageOriginalName(entity.getBeforeImageOriginalName())
                .afterImageUrl(entity.getAfterImageUrl())
                .afterImageOriginalName(entity.getAfterImageOriginalName())
                .viewCount(entity.getViewCount())
                .createdAtText(entity.getCreatedAt() == null ? "-" : entity.getCreatedAt().format(ADMIN_DATE_TIME_FORMATTER))
                .updatedAtText(entity.getUpdatedAt() == null ? "-" : entity.getUpdatedAt().format(ADMIN_DATE_TIME_FORMATTER))
                .build();
    }

    private FrontBeforeAfterItemResponse toFrontItemResponse(BeforeAfter entity) {
        return FrontBeforeAfterItemResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())
                .beforeImageUrl(entity.getBeforeImageUrl())
                .afterImageUrl(entity.getAfterImageUrl())
                .viewCount(entity.getViewCount())
                .createdDateText(entity.getCreatedAt() == null ? "-" : entity.getCreatedAt().format(FRONT_DATE_FORMATTER))
                .build();
    }
}