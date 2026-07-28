package com.dev.SaeKimJP.service.beforeAfter;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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
        return toAdminDetailResponse(getEntity(id));
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
        validateCreateViewPairs(request);

        BeforeAfter entity = BeforeAfter.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(BeforeAfterCategory.fromCode(request.getCategory()))
                .build();

        beforeAfterRepository.saveAndFlush(entity);

        List<String> newlyStoredPaths = new ArrayList<>();

        try {
            applyCreatePair(
                    entity,
                    request.getBeforeFrontImageFile(),
                    request.getAfterFrontImageFile(),
                    BeforeAfterImageSlot.BEFORE_FRONT,
                    BeforeAfterImageSlot.AFTER_FRONT,
                    newlyStoredPaths
            );
            applyCreatePair(
                    entity,
                    request.getBeforeAngle45ImageFile(),
                    request.getAfterAngle45ImageFile(),
                    BeforeAfterImageSlot.BEFORE_ANGLE45,
                    BeforeAfterImageSlot.AFTER_ANGLE45,
                    newlyStoredPaths
            );
            applyCreatePair(
                    entity,
                    request.getBeforeAngle90ImageFile(),
                    request.getAfterAngle90ImageFile(),
                    BeforeAfterImageSlot.BEFORE_ANGLE90,
                    BeforeAfterImageSlot.AFTER_ANGLE90,
                    newlyStoredPaths
            );

            validateFinalViewState(entity);
            beforeAfterRepository.saveAndFlush(entity);
            registerFileCleanupAfterTransaction(List.of(), newlyStoredPaths);

            return toAdminDetailResponse(entity);
        } catch (RuntimeException e) {
            newlyStoredPaths.forEach(beforeAfterFileStoreService::deleteQuietly);
            throw e;
        }
    }

    @Transactional
    public BeforeAfterAdminDetailResponse update(Long id, BeforeAfterUpdateRequest request) {
        validateCommonFields(request.getTitle(), request.getDescription(), request.getCategory());

        BeforeAfter entity = getEntity(id);
        List<String> oldPathsToDeleteAfterCommit = new ArrayList<>();
        List<String> newlyStoredPaths = new ArrayList<>();

        try {
            entity.setTitle(request.getTitle().trim());
            entity.setDescription(request.getDescription().trim());
            entity.setCategory(BeforeAfterCategory.fromCode(request.getCategory()));

            applyUpdatePair(
                    entity,
                    "정면",
                    request.isRemoveFrontView(),
                    request.getBeforeFrontImageFile(),
                    request.getAfterFrontImageFile(),
                    BeforeAfterImageSlot.BEFORE_FRONT,
                    BeforeAfterImageSlot.AFTER_FRONT,
                    oldPathsToDeleteAfterCommit,
                    newlyStoredPaths
            );
            applyUpdatePair(
                    entity,
                    "45도",
                    request.isRemoveAngle45View(),
                    request.getBeforeAngle45ImageFile(),
                    request.getAfterAngle45ImageFile(),
                    BeforeAfterImageSlot.BEFORE_ANGLE45,
                    BeforeAfterImageSlot.AFTER_ANGLE45,
                    oldPathsToDeleteAfterCommit,
                    newlyStoredPaths
            );
            applyUpdatePair(
                    entity,
                    "90도",
                    request.isRemoveAngle90View(),
                    request.getBeforeAngle90ImageFile(),
                    request.getAfterAngle90ImageFile(),
                    BeforeAfterImageSlot.BEFORE_ANGLE90,
                    BeforeAfterImageSlot.AFTER_ANGLE90,
                    oldPathsToDeleteAfterCommit,
                    newlyStoredPaths
            );

            validateFinalViewState(entity);
            beforeAfterRepository.saveAndFlush(entity);
            registerFileCleanupAfterTransaction(oldPathsToDeleteAfterCommit, newlyStoredPaths);

            return toAdminDetailResponse(entity);
        } catch (RuntimeException e) {
            newlyStoredPaths.forEach(beforeAfterFileStoreService::deleteQuietly);
            throw e;
        }
    }

    @Transactional
    public void delete(Long id) {
        BeforeAfter entity = getEntity(id);
        List<String> deletePaths = getAllImagePaths(entity);

        beforeAfterRepository.delete(entity);
        beforeAfterRepository.flush();

        registerFileCleanupAfterTransaction(deletePaths, List.of());
    }

    private void validateCreateViewPairs(BeforeAfterCreateRequest request) {
        int selectedPairCount = 0;

        selectedPairCount += validateCreatePair(
                "정면",
                request.getBeforeFrontImageFile(),
                request.getAfterFrontImageFile()
        );
        selectedPairCount += validateCreatePair(
                "45도",
                request.getBeforeAngle45ImageFile(),
                request.getAfterAngle45ImageFile()
        );
        selectedPairCount += validateCreatePair(
                "90도",
                request.getBeforeAngle90ImageFile(),
                request.getAfterAngle90ImageFile()
        );

        if (selectedPairCount < 1) {
            throw new IllegalArgumentException("정면, 45도, 90도 중 하나 이상의 Before·After 이미지 쌍을 등록해 주세요.");
        }
    }

    private int validateCreatePair(String label, MultipartFile beforeFile, MultipartFile afterFile) {
        boolean hasBefore = hasFile(beforeFile);
        boolean hasAfter = hasFile(afterFile);

        if (hasBefore != hasAfter) {
            throw new IllegalArgumentException(label + " 이미지는 Before와 After를 모두 등록해야 합니다.");
        }

        return hasBefore ? 1 : 0;
    }

    private void applyCreatePair(
            BeforeAfter entity,
            MultipartFile beforeFile,
            MultipartFile afterFile,
            BeforeAfterImageSlot beforeSlot,
            BeforeAfterImageSlot afterSlot,
            List<String> newlyStoredPaths
    ) {
        if (!hasFile(beforeFile) && !hasFile(afterFile)) {
            return;
        }

        applyImage(entity, beforeFile, beforeSlot, newlyStoredPaths);
        applyImage(entity, afterFile, afterSlot, newlyStoredPaths);
    }

    private void applyUpdatePair(
            BeforeAfter entity,
            String label,
            boolean removeView,
            MultipartFile beforeFile,
            MultipartFile afterFile,
            BeforeAfterImageSlot beforeSlot,
            BeforeAfterImageSlot afterSlot,
            List<String> oldPathsToDeleteAfterCommit,
            List<String> newlyStoredPaths
    ) {
        if (removeView && (hasFile(beforeFile) || hasFile(afterFile))) {
            throw new IllegalArgumentException(label + " 시점은 삭제와 이미지 변경을 동시에 처리할 수 없습니다.");
        }

        if (removeView) {
            removeImage(entity, beforeSlot, oldPathsToDeleteAfterCommit);
            removeImage(entity, afterSlot, oldPathsToDeleteAfterCommit);
            return;
        }

        if (hasFile(beforeFile)) {
            replaceImage(
                    entity,
                    beforeFile,
                    beforeSlot,
                    oldPathsToDeleteAfterCommit,
                    newlyStoredPaths
            );
        }

        if (hasFile(afterFile)) {
            replaceImage(
                    entity,
                    afterFile,
                    afterSlot,
                    oldPathsToDeleteAfterCommit,
                    newlyStoredPaths
            );
        }

        validatePairState(entity, label, beforeSlot, afterSlot);
    }

    private void validateFinalViewState(BeforeAfter entity) {
        validatePairState(
                entity,
                "정면",
                BeforeAfterImageSlot.BEFORE_FRONT,
                BeforeAfterImageSlot.AFTER_FRONT
        );
        validatePairState(
                entity,
                "45도",
                BeforeAfterImageSlot.BEFORE_ANGLE45,
                BeforeAfterImageSlot.AFTER_ANGLE45
        );
        validatePairState(
                entity,
                "90도",
                BeforeAfterImageSlot.BEFORE_ANGLE90,
                BeforeAfterImageSlot.AFTER_ANGLE90
        );

        if (calculateViewCount(entity) < 1) {
            throw new IllegalArgumentException("정면, 45도, 90도 중 하나 이상의 Before·After 이미지 쌍이 필요합니다.");
        }
    }

    private void validatePairState(
            BeforeAfter entity,
            String label,
            BeforeAfterImageSlot beforeSlot,
            BeforeAfterImageSlot afterSlot
    ) {
        boolean hasBefore = hasStoredImage(entity, beforeSlot);
        boolean hasAfter = hasStoredImage(entity, afterSlot);

        if (hasBefore != hasAfter) {
            throw new IllegalArgumentException(label + " 이미지는 Before와 After가 모두 있어야 합니다.");
        }
    }

    private void replaceImage(
            BeforeAfter entity,
            MultipartFile file,
            BeforeAfterImageSlot slot,
            List<String> oldPathsToDeleteAfterCommit,
            List<String> newlyStoredPaths
    ) {
        String oldPath = getImagePath(entity, slot);

        applyImage(entity, file, slot, newlyStoredPaths);

        if (StringUtils.hasText(oldPath)) {
            oldPathsToDeleteAfterCommit.add(oldPath);
        }
    }

    private void removeImage(
            BeforeAfter entity,
            BeforeAfterImageSlot slot,
            List<String> oldPathsToDeleteAfterCommit
    ) {
        String oldPath = getImagePath(entity, slot);

        if (StringUtils.hasText(oldPath)) {
            oldPathsToDeleteAfterCommit.add(oldPath);
        }

        clearImage(entity, slot);
    }

    private void applyImage(
            BeforeAfter entity,
            MultipartFile file,
            BeforeAfterImageSlot slot,
            List<String> newlyStoredPaths
    ) {
        StoredFileInfo storedFileInfo = beforeAfterFileStoreService.store(entity.getId(), file, slot);
        newlyStoredPaths.add(storedFileInfo.getFullPath());
        setImage(entity, slot, storedFileInfo);
    }

    private void setImage(BeforeAfter entity, BeforeAfterImageSlot slot, StoredFileInfo storedFileInfo) {
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

    private void clearImage(BeforeAfter entity, BeforeAfterImageSlot slot) {
        switch (slot) {
            case BEFORE_FRONT -> {
                entity.setBeforeFrontImageOriginalName(null);
                entity.setBeforeFrontImagePath(null);
                entity.setBeforeFrontImageUrl(null);
            }
            case BEFORE_ANGLE45 -> {
                entity.setBeforeAngle45ImageOriginalName(null);
                entity.setBeforeAngle45ImagePath(null);
                entity.setBeforeAngle45ImageUrl(null);
            }
            case BEFORE_ANGLE90 -> {
                entity.setBeforeAngle90ImageOriginalName(null);
                entity.setBeforeAngle90ImagePath(null);
                entity.setBeforeAngle90ImageUrl(null);
            }
            case AFTER_FRONT -> {
                entity.setAfterFrontImageOriginalName(null);
                entity.setAfterFrontImagePath(null);
                entity.setAfterFrontImageUrl(null);
            }
            case AFTER_ANGLE45 -> {
                entity.setAfterAngle45ImageOriginalName(null);
                entity.setAfterAngle45ImagePath(null);
                entity.setAfterAngle45ImageUrl(null);
            }
            case AFTER_ANGLE90 -> {
                entity.setAfterAngle90ImageOriginalName(null);
                entity.setAfterAngle90ImagePath(null);
                entity.setAfterAngle90ImageUrl(null);
            }
        }
    }

    private String getImageUrl(BeforeAfter entity, BeforeAfterImageSlot slot) {
        return switch (slot) {
            case BEFORE_FRONT -> entity.getBeforeFrontImageUrl();
            case BEFORE_ANGLE45 -> entity.getBeforeAngle45ImageUrl();
            case BEFORE_ANGLE90 -> entity.getBeforeAngle90ImageUrl();
            case AFTER_FRONT -> entity.getAfterFrontImageUrl();
            case AFTER_ANGLE45 -> entity.getAfterAngle45ImageUrl();
            case AFTER_ANGLE90 -> entity.getAfterAngle90ImageUrl();
        };
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

    private boolean hasStoredImage(BeforeAfter entity, BeforeAfterImageSlot slot) {
        return StringUtils.hasText(getImageUrl(entity, slot));
    }

    private boolean hasCompletePair(
            BeforeAfter entity,
            BeforeAfterImageSlot beforeSlot,
            BeforeAfterImageSlot afterSlot
    ) {
        return hasStoredImage(entity, beforeSlot) && hasStoredImage(entity, afterSlot);
    }

    private int calculateViewCount(BeforeAfter entity) {
        int count = 0;

        if (hasCompletePair(entity, BeforeAfterImageSlot.BEFORE_FRONT, BeforeAfterImageSlot.AFTER_FRONT)) {
            count++;
        }

        if (hasCompletePair(entity, BeforeAfterImageSlot.BEFORE_ANGLE45, BeforeAfterImageSlot.AFTER_ANGLE45)) {
            count++;
        }

        if (hasCompletePair(entity, BeforeAfterImageSlot.BEFORE_ANGLE90, BeforeAfterImageSlot.AFTER_ANGLE90)) {
            count++;
        }

        return count;
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

    private void registerFileCleanupAfterTransaction(
            List<String> oldPathsToDeleteAfterCommit,
            List<String> newlyStoredPaths
    ) {
        List<String> oldPaths = oldPathsToDeleteAfterCommit.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .toList();
        List<String> newPaths = newlyStoredPaths.stream()
                .filter(StringUtils::hasText)
                .distinct()
                .toList();

        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            oldPaths.forEach(beforeAfterFileStoreService::deleteQuietly);
            return;
        }

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                oldPaths.forEach(beforeAfterFileStoreService::deleteQuietly);
            }

            @Override
            public void afterCompletion(int status) {
                if (status != TransactionSynchronization.STATUS_COMMITTED) {
                    newPaths.forEach(beforeAfterFileStoreService::deleteQuietly);
                }
            }
        });
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
                .viewCount(calculateViewCount(entity))
                .beforeFrontImageUrl(entity.getBeforeFrontImageUrl())
                .beforeAngle45ImageUrl(entity.getBeforeAngle45ImageUrl())
                .beforeAngle90ImageUrl(entity.getBeforeAngle90ImageUrl())
                .afterFrontImageUrl(entity.getAfterFrontImageUrl())
                .afterAngle45ImageUrl(entity.getAfterAngle45ImageUrl())
                .afterAngle90ImageUrl(entity.getAfterAngle90ImageUrl())
                .createdAtText(formatAdminDateTime(entity.getCreatedAt()))
                .updatedAtText(formatAdminDateTime(entity.getUpdatedAt()))
                .build();
    }

    private BeforeAfterAdminDetailResponse toAdminDetailResponse(BeforeAfter entity) {
        return BeforeAfterAdminDetailResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())
                .viewCount(calculateViewCount(entity))
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
                .createdAtText(formatAdminDateTime(entity.getCreatedAt()))
                .updatedAtText(formatAdminDateTime(entity.getUpdatedAt()))
                .build();
    }

    private FrontBeforeAfterItemResponse toFrontItemResponse(BeforeAfter entity) {
        return FrontBeforeAfterItemResponse.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .categoryCode(entity.getCategory().getCode())
                .categoryLabel(entity.getCategory().getLabel())
                .viewCount(calculateViewCount(entity))
                .beforeFrontImageUrl(entity.getBeforeFrontImageUrl())
                .beforeAngle45ImageUrl(entity.getBeforeAngle45ImageUrl())
                .beforeAngle90ImageUrl(entity.getBeforeAngle90ImageUrl())
                .afterFrontImageUrl(entity.getAfterFrontImageUrl())
                .afterAngle45ImageUrl(entity.getAfterAngle45ImageUrl())
                .afterAngle90ImageUrl(entity.getAfterAngle90ImageUrl())
                .createdDateText(entity.getCreatedAt() == null
                        ? "-"
                        : entity.getCreatedAt().format(FRONT_DATE_FORMATTER))
                .build();
    }

    private String formatAdminDateTime(java.time.LocalDateTime value) {
        return value == null ? "-" : value.format(ADMIN_DATE_TIME_FORMATTER);
    }
}
