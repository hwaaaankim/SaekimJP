package com.dev.SaeKimJP.service.beforeAfter;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterImageSlot;
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
        validateRequiredCreateImages(request);

        BeforeAfter entity = BeforeAfter.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(BeforeAfterCategory.fromCode(request.getCategory()))

                .beforeFrontImageUrl("")
                .beforeFrontImagePath("")
                .beforeFrontImageOriginalName("")

                .beforeAngle45ImageUrl("")
                .beforeAngle45ImagePath("")
                .beforeAngle45ImageOriginalName("")

                .beforeAngle90ImageUrl("")
                .beforeAngle90ImagePath("")
                .beforeAngle90ImageOriginalName("")

                .afterFrontImageUrl("")
                .afterFrontImagePath("")
                .afterFrontImageOriginalName("")

                .afterAngle45ImageUrl("")
                .afterAngle45ImagePath("")
                .afterAngle45ImageOriginalName("")

                .afterAngle90ImageUrl("")
                .afterAngle90ImagePath("")
                .afterAngle90ImageOriginalName("")
                .build();

        beforeAfterRepository.save(entity);

        try {
            applyImage(entity, request.getBeforeFrontImageFile(), BeforeAfterImageSlot.BEFORE_FRONT);
            applyImage(entity, request.getBeforeAngle45ImageFile(), BeforeAfterImageSlot.BEFORE_ANGLE45);
            applyImage(entity, request.getBeforeAngle90ImageFile(), BeforeAfterImageSlot.BEFORE_ANGLE90);

            applyImage(entity, request.getAfterFrontImageFile(), BeforeAfterImageSlot.AFTER_FRONT);
            applyImage(entity, request.getAfterAngle45ImageFile(), BeforeAfterImageSlot.AFTER_ANGLE45);
            applyImage(entity, request.getAfterAngle90ImageFile(), BeforeAfterImageSlot.AFTER_ANGLE90);

            beforeAfterRepository.save(entity);

            return toAdminDetailResponse(entity);
        } catch (RuntimeException e) {
            getAllImagePaths(entity).forEach(beforeAfterFileStoreService::deleteQuietly);
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

        if (hasFile(request.getBeforeFrontImageFile())) {
            replaceImage(entity, request.getBeforeFrontImageFile(), BeforeAfterImageSlot.BEFORE_FRONT);
        }

        if (hasFile(request.getBeforeAngle45ImageFile())) {
            replaceImage(entity, request.getBeforeAngle45ImageFile(), BeforeAfterImageSlot.BEFORE_ANGLE45);
        }

        if (hasFile(request.getBeforeAngle90ImageFile())) {
            replaceImage(entity, request.getBeforeAngle90ImageFile(), BeforeAfterImageSlot.BEFORE_ANGLE90);
        }

        if (hasFile(request.getAfterFrontImageFile())) {
            replaceImage(entity, request.getAfterFrontImageFile(), BeforeAfterImageSlot.AFTER_FRONT);
        }

        if (hasFile(request.getAfterAngle45ImageFile())) {
            replaceImage(entity, request.getAfterAngle45ImageFile(), BeforeAfterImageSlot.AFTER_ANGLE45);
        }

        if (hasFile(request.getAfterAngle90ImageFile())) {
            replaceImage(entity, request.getAfterAngle90ImageFile(), BeforeAfterImageSlot.AFTER_ANGLE90);
        }

        return toAdminDetailResponse(entity);
    }

    @Transactional
    public void delete(Long id) {
        BeforeAfter entity = getEntity(id);
        List<String> deletePaths = getAllImagePaths(entity);

        beforeAfterRepository.delete(entity);

        deletePaths.forEach(beforeAfterFileStoreService::deleteQuietly);
    }

    private void validateRequiredCreateImages(BeforeAfterCreateRequest request) {
        if (!hasFile(request.getBeforeFrontImageFile())) {
            throw new IllegalArgumentException("Before 정면 이미지는 필수입니다.");
        }

        if (!hasFile(request.getBeforeAngle45ImageFile())) {
            throw new IllegalArgumentException("Before 45도 이미지는 필수입니다.");
        }

        if (!hasFile(request.getBeforeAngle90ImageFile())) {
            throw new IllegalArgumentException("Before 90도 이미지는 필수입니다.");
        }

        if (!hasFile(request.getAfterFrontImageFile())) {
            throw new IllegalArgumentException("After 정면 이미지는 필수입니다.");
        }

        if (!hasFile(request.getAfterAngle45ImageFile())) {
            throw new IllegalArgumentException("After 45도 이미지는 필수입니다.");
        }

        if (!hasFile(request.getAfterAngle90ImageFile())) {
            throw new IllegalArgumentException("After 90도 이미지는 필수입니다.");
        }
    }

    private void replaceImage(BeforeAfter entity, MultipartFile file, BeforeAfterImageSlot slot) {
        String oldPath = getImagePath(entity, slot);
        applyImage(entity, file, slot);
        beforeAfterFileStoreService.deleteQuietly(oldPath);
    }

    private void applyImage(BeforeAfter entity, MultipartFile file, BeforeAfterImageSlot slot) {
        StoredFileInfo storedFileInfo = beforeAfterFileStoreService.store(entity.getId(), file, slot);

        switch (slot) {
            case BEFORE_FRONT -> {
                entity.setBeforeFrontImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setBeforeFrontImagePath(storedFileInfo.getFullPath());
                entity.setBeforeFrontImageUrl(storedFileInfo.getUrl());
            }
            case BEFORE_ANGLE45 -> {
                entity.setBeforeAngle45ImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setBeforeAngle45ImagePath(storedFileInfo.getFullPath());
                entity.setBeforeAngle45ImageUrl(storedFileInfo.getUrl());
            }
            case BEFORE_ANGLE90 -> {
                entity.setBeforeAngle90ImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setBeforeAngle90ImagePath(storedFileInfo.getFullPath());
                entity.setBeforeAngle90ImageUrl(storedFileInfo.getUrl());
            }
            case AFTER_FRONT -> {
                entity.setAfterFrontImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setAfterFrontImagePath(storedFileInfo.getFullPath());
                entity.setAfterFrontImageUrl(storedFileInfo.getUrl());
            }
            case AFTER_ANGLE45 -> {
                entity.setAfterAngle45ImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setAfterAngle45ImagePath(storedFileInfo.getFullPath());
                entity.setAfterAngle45ImageUrl(storedFileInfo.getUrl());
            }
            case AFTER_ANGLE90 -> {
                entity.setAfterAngle90ImageOriginalName(storedFileInfo.getOriginalFilename());
                entity.setAfterAngle90ImagePath(storedFileInfo.getFullPath());
                entity.setAfterAngle90ImageUrl(storedFileInfo.getUrl());
            }
        }
    }

    private String getImagePath(BeforeAfter entity, BeforeAfterImageSlot slot) {
        return switch (slot) {
            case BEFORE_FRONT -> entity.getBeforeFrontImagePath();
            case BEFORE_ANGLE45 -> entity.getBeforeAngle45ImagePath();
            case BEFORE_ANGLE90 -> entity.getBeforeAngle90ImagePath();
            case AFTER_FRONT -> entity.getAfterFrontImagePath();
            case AFTER_ANGLE45 -> entity.getAfterAngle45ImagePath();
            case AFTER_ANGLE90 -> entity.getAfterAngle90ImagePath();
        };
    }

    private List<String> getAllImagePaths(BeforeAfter entity) {
        List<String> paths = new ArrayList<>();

        paths.add(entity.getBeforeFrontImagePath());
        paths.add(entity.getBeforeAngle45ImagePath());
        paths.add(entity.getBeforeAngle90ImagePath());
        paths.add(entity.getAfterFrontImagePath());
        paths.add(entity.getAfterAngle45ImagePath());
        paths.add(entity.getAfterAngle90ImagePath());

        return paths.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
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

    private String fallback(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }

    private BeforeAfterAdminListItemResponse toAdminListItemResponse(BeforeAfter entity) {
        return BeforeAfterAdminListItemResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())

                .beforeFrontImageUrl(entity.getBeforeFrontImageUrl())
                .beforeAngle45ImageUrl(fallback(entity.getBeforeAngle45ImageUrl(), entity.getBeforeFrontImageUrl()))
                .beforeAngle90ImageUrl(fallback(entity.getBeforeAngle90ImageUrl(), entity.getBeforeFrontImageUrl()))

                .afterFrontImageUrl(entity.getAfterFrontImageUrl())
                .afterAngle45ImageUrl(fallback(entity.getAfterAngle45ImageUrl(), entity.getAfterFrontImageUrl()))
                .afterAngle90ImageUrl(fallback(entity.getAfterAngle90ImageUrl(), entity.getAfterFrontImageUrl()))

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

                .beforeFrontImageUrl(entity.getBeforeFrontImageUrl())
                .beforeFrontImageOriginalName(entity.getBeforeFrontImageOriginalName())

                .beforeAngle45ImageUrl(entity.getBeforeAngle45ImageUrl())
                .beforeAngle45ImageOriginalName(entity.getBeforeAngle45ImageOriginalName())

                .beforeAngle90ImageUrl(entity.getBeforeAngle90ImageUrl())
                .beforeAngle90ImageOriginalName(entity.getBeforeAngle90ImageOriginalName())

                .afterFrontImageUrl(entity.getAfterFrontImageUrl())
                .afterFrontImageOriginalName(entity.getAfterFrontImageOriginalName())

                .afterAngle45ImageUrl(entity.getAfterAngle45ImageUrl())
                .afterAngle45ImageOriginalName(entity.getAfterAngle45ImageOriginalName())

                .afterAngle90ImageUrl(entity.getAfterAngle90ImageUrl())
                .afterAngle90ImageOriginalName(entity.getAfterAngle90ImageOriginalName())

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

                .beforeFrontImageUrl(entity.getBeforeFrontImageUrl())
                .beforeAngle45ImageUrl(fallback(entity.getBeforeAngle45ImageUrl(), entity.getBeforeFrontImageUrl()))
                .beforeAngle90ImageUrl(fallback(entity.getBeforeAngle90ImageUrl(), entity.getBeforeFrontImageUrl()))

                .afterFrontImageUrl(entity.getAfterFrontImageUrl())
                .afterAngle45ImageUrl(fallback(entity.getAfterAngle45ImageUrl(), entity.getAfterFrontImageUrl()))
                .afterAngle90ImageUrl(fallback(entity.getAfterAngle90ImageUrl(), entity.getAfterFrontImageUrl()))

                .createdDateText(entity.getCreatedAt() == null ? "-" : entity.getCreatedAt().format(FRONT_DATE_FORMATTER))
                .build();
    }
}