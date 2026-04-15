package com.dev.SaeKimJP.service.surgery;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;

import com.dev.SaeKimJP.dto.surgery.AdminSurgeryDetailResponse;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryIconDetailDto;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryMiddleDto;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryPageResponse;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryPreviewImageDto;
import com.dev.SaeKimJP.dto.surgery.AdminSurgerySimpleDetailDto;
import com.dev.SaeKimJP.dto.surgery.AdminSurgeryStepDetailDto;
import com.dev.SaeKimJP.dto.surgery.SurgeryDetailItemRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryDetailUpsertRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryMiddleCreateRequest;
import com.dev.SaeKimJP.dto.surgery.SurgeryMiddleUpdateRequest;
import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.model.surgery.SurgeryDetailCategory;
import com.dev.SaeKimJP.model.surgery.SurgeryDetailIcon;
import com.dev.SaeKimJP.model.surgery.SurgeryDetailStep;
import com.dev.SaeKimJP.model.surgery.SurgeryMiddleCategory;
import com.dev.SaeKimJP.model.surgery.SurgeryPreviewImage;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailCategoryRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailIconRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailStepRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryMiddleCategoryRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryPreviewImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurgeryAdminService {

    private final SurgeryPreviewImageRepository previewImageRepository;
    private final SurgeryMiddleCategoryRepository middleCategoryRepository;
    private final SurgeryDetailCategoryRepository detailCategoryRepository;
    private final SurgeryDetailStepRepository detailStepRepository;
    private final SurgeryDetailIconRepository detailIconRepository;
    private final SurgeryFileStorageService surgeryFileStorageService;

    public AdminSurgeryPageResponse getAdminPageData(SurgeryGroupType groupType) {
        List<AdminSurgeryPreviewImageDto> previewImages = previewImageRepository
                .findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType)
                .stream()
                .map(it -> new AdminSurgeryPreviewImageDto(
                        it.getId(),
                        it.getImageUrl(),
                        it.getAltText(),
                        it.getDisplayOrder(),
                        it.isActive()
                ))
                .toList();

        List<SurgeryMiddleCategory> middleCategories =
                middleCategoryRepository.findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType);

        List<AdminSurgeryMiddleDto> middleDtos = middleCategories.stream()
                .map(middle -> {
                    List<AdminSurgerySimpleDetailDto> detailDtos = detailCategoryRepository
                            .findByMiddleCategory_IdOrderByDisplayOrderAscIdAsc(middle.getId())
                            .stream()
                            .map(detail -> new AdminSurgerySimpleDetailDto(
                                    detail.getId(),
                                    detail.getName(),
                                    detail.getDisplayOrder()
                            ))
                            .toList();

                    return new AdminSurgeryMiddleDto(
                            middle.getId(),
                            middle.getName(),
                            middle.getIntroText(),
                            middle.getDisplayOrder(),
                            detailDtos.size(),
                            detailDtos
                    );
                })
                .toList();

        return new AdminSurgeryPageResponse(
                groupType.name(),
                groupType.getLabel(),
                previewImages,
                middleDtos
        );
    }

    @Transactional
    public void createPreviewImages(SurgeryGroupType groupType, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new IllegalArgumentException("미리보기 이미지를 선택해 주세요.");
        }

        long startOrder = previewImageRepository.countByGroupType(groupType);

        int index = 0;
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            SurgeryFileStorageService.StoredSurgeryFile stored =
                    surgeryFileStorageService.storePreviewFile(groupType, file);

            previewImageRepository.save(new SurgeryPreviewImage(
                    groupType,
                    stored.imageUrl(),
                    stored.relativePath(),
                    stored.originalName(),
                    groupType.getLabel() + " 수술 미리보기",
                    (int) startOrder + index
            ));
            index++;
        }
    }

    @Transactional
    public void deletePreviewImage(Long previewImageId) {
        SurgeryPreviewImage previewImage = previewImageRepository.findById(previewImageId)
                .orElseThrow(() -> new IllegalArgumentException("미리보기 이미지를 찾을 수 없습니다."));

        SurgeryGroupType groupType = previewImage.getGroupType();

        surgeryFileStorageService.deleteQuietly(previewImage.getImagePath());
        previewImageRepository.delete(previewImage);

        compressPreviewOrders(groupType);
    }

    @Transactional
    public void reorderPreviewImages(SurgeryGroupType groupType, List<Long> ids) {
        List<SurgeryPreviewImage> items = previewImageRepository.findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType);
        validateSameIds(items.stream().map(SurgeryPreviewImage::getId).toList(), ids);

        Map<Long, SurgeryPreviewImage> map = items.stream()
                .collect(Collectors.toMap(SurgeryPreviewImage::getId, Function.identity()));

        for (int i = 0; i < ids.size(); i++) {
            map.get(ids.get(i)).changeOrder(i);
        }
    }

    @Transactional
    public void createMiddleCategory(SurgeryGroupType groupType, SurgeryMiddleCreateRequest request) {
        int nextOrder = (int) middleCategoryRepository.countByGroupType(groupType);

        middleCategoryRepository.save(
                new SurgeryMiddleCategory(
                        groupType,
                        normalize(request.getName()),
                        normalize(request.getIntroText()),
                        nextOrder
                )
        );
    }

    @Transactional
    public void updateMiddleCategory(Long middleCategoryId, SurgeryMiddleUpdateRequest request) {
        SurgeryMiddleCategory middle = middleCategoryRepository.findById(middleCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("중분류를 찾을 수 없습니다."));

        middle.changeBasic(normalize(request.getName()), normalize(request.getIntroText()));

        if (request.getActive() != null) {
            middle.changeActive(request.getActive());
        }
    }

    @Transactional
    public void deleteMiddleCategory(Long middleCategoryId) {
        SurgeryMiddleCategory middle = middleCategoryRepository.findById(middleCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("중분류를 찾을 수 없습니다."));

        if (detailCategoryRepository.existsByMiddleCategory_Id(middleCategoryId)) {
            throw new IllegalArgumentException("소분류가 존재하는 중분류는 삭제할 수 없습니다.");
        }

        SurgeryGroupType groupType = middle.getGroupType();

        middleCategoryRepository.delete(middle);

        compressMiddleOrders(groupType);
    }

    @Transactional
    public void reorderMiddleCategories(SurgeryGroupType groupType, List<Long> ids) {
        List<SurgeryMiddleCategory> middles =
                middleCategoryRepository.findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType);

        validateSameIds(middles.stream().map(SurgeryMiddleCategory::getId).toList(), ids);

        Map<Long, SurgeryMiddleCategory> map = middles.stream()
                .collect(Collectors.toMap(SurgeryMiddleCategory::getId, Function.identity()));

        for (int i = 0; i < ids.size(); i++) {
            map.get(ids.get(i)).changeOrder(i);
        }
    }

    public AdminSurgeryDetailResponse getDetail(Long detailId) {
        SurgeryDetailCategory detail = detailCategoryRepository.findById(detailId)
                .orElseThrow(() -> new IllegalArgumentException("소분류를 찾을 수 없습니다."));

        List<AdminSurgeryStepDetailDto> steps = detailStepRepository
                .findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detailId)
                .stream()
                .map(step -> new AdminSurgeryStepDetailDto(
                        step.getId(),
                        step.getTitle(),
                        step.getDescriptionText(),
                        step.getImageUrl(),
                        step.getDisplayOrder()
                ))
                .toList();

        List<AdminSurgeryIconDetailDto> icons = detailIconRepository
                .findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detailId)
                .stream()
                .map(icon -> new AdminSurgeryIconDetailDto(
                        icon.getId(),
                        icon.getTitle(),
                        icon.getDescriptionText(),
                        icon.getImageUrl(),
                        icon.getDisplayOrder()
                ))
                .toList();

        return new AdminSurgeryDetailResponse(
                detail.getId(),
                detail.getMiddleCategory().getId(),
                detail.getName(),
                detail.getIntroText(),
                detail.isActive(),
                steps,
                icons
        );
    }

    @Transactional
    public void createDetail(SurgeryGroupType groupType, SurgeryDetailUpsertRequest request, MultipartHttpServletRequest multipartRequest) {
        SurgeryMiddleCategory middle = getValidatedMiddle(groupType, request.getMiddleCategoryId());

        int nextOrder = (int) detailCategoryRepository.countByMiddleCategory_Id(middle.getId());

        SurgeryDetailCategory detail = detailCategoryRepository.save(
                new SurgeryDetailCategory(
                        middle,
                        normalize(request.getName()),
                        normalize(request.getIntroText()),
                        nextOrder
                )
        );

        saveOrUpdateSteps(detail, request.getSteps(), multipartRequest, true);
        saveOrUpdateIcons(detail, request.getIcons(), multipartRequest, true);
    }

    @Transactional
    public void updateDetail(SurgeryGroupType groupType, Long detailId, SurgeryDetailUpsertRequest request, MultipartHttpServletRequest multipartRequest) {
        SurgeryDetailCategory detail = detailCategoryRepository.findById(detailId)
                .orElseThrow(() -> new IllegalArgumentException("소분류를 찾을 수 없습니다."));

        SurgeryMiddleCategory middle = getValidatedMiddle(groupType, request.getMiddleCategoryId());
        detail.changeBasic(middle, normalize(request.getName()), normalize(request.getIntroText()));

        if (request.getActive() != null) {
            detail.changeActive(request.getActive());
        }

        saveOrUpdateSteps(detail, request.getSteps(), multipartRequest, false);
        saveOrUpdateIcons(detail, request.getIcons(), multipartRequest, false);
    }

    @Transactional
    public void deleteDetail(Long detailId) {
        SurgeryDetailCategory detail = detailCategoryRepository.findById(detailId)
                .orElseThrow(() -> new IllegalArgumentException("소분류를 찾을 수 없습니다."));

        Long middleCategoryId = detail.getMiddleCategory().getId();

        detailStepRepository.findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detailId)
                .forEach(step -> surgeryFileStorageService.deleteQuietly(step.getImagePath()));

        detailIconRepository.findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detailId)
                .forEach(icon -> surgeryFileStorageService.deleteQuietly(icon.getImagePath()));

        detailCategoryRepository.delete(detail);

        compressDetailOrders(middleCategoryId);
    }

    @Transactional
    public void reorderDetails(Long middleCategoryId, List<Long> ids) {
        List<SurgeryDetailCategory> details =
                detailCategoryRepository.findByMiddleCategory_IdOrderByDisplayOrderAscIdAsc(middleCategoryId);

        validateSameIds(details.stream().map(SurgeryDetailCategory::getId).toList(), ids);

        Map<Long, SurgeryDetailCategory> map = details.stream()
                .collect(Collectors.toMap(SurgeryDetailCategory::getId, Function.identity()));

        for (int i = 0; i < ids.size(); i++) {
            map.get(ids.get(i)).changeOrder(i);
        }
    }

    private void saveOrUpdateSteps(
            SurgeryDetailCategory detail,
            List<SurgeryDetailItemRequest> requests,
            MultipartHttpServletRequest multipartRequest,
            boolean createMode
    ) {
        List<SurgeryDetailStep> existingList = detailStepRepository.findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detail.getId());
        Map<Long, SurgeryDetailStep> existingMap = existingList.stream()
                .collect(Collectors.toMap(SurgeryDetailStep::getId, Function.identity()));

        if (requests == null) {
            return;
        }

        for (int i = 0; i < requests.size(); i++) {
            SurgeryDetailItemRequest item = requests.get(i);
            boolean deleted = Boolean.TRUE.equals(item.getDeleted());

            if (item.getId() != null) {
                SurgeryDetailStep step = existingMap.get(item.getId());
                if (step == null) {
                    throw new IllegalArgumentException("수정 대상 step 을 찾을 수 없습니다.");
                }

                if (deleted) {
                    surgeryFileStorageService.deleteQuietly(step.getImagePath());
                    detailStepRepository.delete(step);
                    continue;
                }

                step.changeBasic(
                        normalizeNullable(item.getTitle()),
                        normalize(item.getDescriptionText()),
                        safeOrder(item.getDisplayOrder(), i)
                );

                MultipartFile replaceFile = multipartRequest.getFile("stepFile__" + item.getClientKey());
                if (replaceFile != null && !replaceFile.isEmpty()) {
                    surgeryFileStorageService.deleteQuietly(step.getImagePath());
                    SurgeryFileStorageService.StoredSurgeryFile stored =
                            surgeryFileStorageService.storeStepFile(detail.getMiddleCategory().getGroupType(), detail.getId(), replaceFile);
                    step.changeImage(stored.imageUrl(), stored.relativePath(), stored.originalName());
                }
                continue;
            }

            if (deleted) {
                continue;
            }

            MultipartFile newFile = multipartRequest.getFile("stepFile__" + item.getClientKey());
            if (newFile == null || newFile.isEmpty()) {
                if (createMode) {
                    throw new IllegalArgumentException("새 step 이미지가 누락되었습니다.");
                }
                continue;
            }

            SurgeryFileStorageService.StoredSurgeryFile stored =
                    surgeryFileStorageService.storeStepFile(detail.getMiddleCategory().getGroupType(), detail.getId(), newFile);

            detailStepRepository.save(new SurgeryDetailStep(
                    detail,
                    normalizeNullable(item.getTitle()),
                    normalize(item.getDescriptionText()),
                    stored.imageUrl(),
                    stored.relativePath(),
                    stored.originalName(),
                    safeOrder(item.getDisplayOrder(), i)
            ));
        }
    }

    
    private void compressPreviewOrders(SurgeryGroupType groupType) {
        List<SurgeryPreviewImage> items = previewImageRepository.findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType);
        for (int i = 0; i < items.size(); i++) {
            items.get(i).changeOrder(i);
        }
    }

    private void compressMiddleOrders(SurgeryGroupType groupType) {
        List<SurgeryMiddleCategory> items = middleCategoryRepository.findByGroupTypeOrderByDisplayOrderAscIdAsc(groupType);
        for (int i = 0; i < items.size(); i++) {
            items.get(i).changeOrder(i);
        }
    }

    private void compressDetailOrders(Long middleCategoryId) {
        List<SurgeryDetailCategory> items = detailCategoryRepository.findByMiddleCategory_IdOrderByDisplayOrderAscIdAsc(middleCategoryId);
        for (int i = 0; i < items.size(); i++) {
            items.get(i).changeOrder(i);
        }
    }
    private void saveOrUpdateIcons(
            SurgeryDetailCategory detail,
            List<SurgeryDetailItemRequest> requests,
            MultipartHttpServletRequest multipartRequest,
            boolean createMode
    ) {
        List<SurgeryDetailIcon> existingList = detailIconRepository.findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detail.getId());
        Map<Long, SurgeryDetailIcon> existingMap = existingList.stream()
                .collect(Collectors.toMap(SurgeryDetailIcon::getId, Function.identity()));

        if (requests == null) {
            return;
        }

        for (int i = 0; i < requests.size(); i++) {
            SurgeryDetailItemRequest item = requests.get(i);
            boolean deleted = Boolean.TRUE.equals(item.getDeleted());

            if (item.getId() != null) {
                SurgeryDetailIcon icon = existingMap.get(item.getId());
                if (icon == null) {
                    throw new IllegalArgumentException("수정 대상 icon 을 찾을 수 없습니다.");
                }

                if (deleted) {
                    surgeryFileStorageService.deleteQuietly(icon.getImagePath());
                    detailIconRepository.delete(icon);
                    continue;
                }

                icon.changeBasic(
                        normalize(item.getTitle()),
                        normalize(item.getDescriptionText()),
                        safeOrder(item.getDisplayOrder(), i)
                );

                MultipartFile replaceFile = multipartRequest.getFile("iconFile__" + item.getClientKey());
                if (replaceFile != null && !replaceFile.isEmpty()) {
                    surgeryFileStorageService.deleteQuietly(icon.getImagePath());
                    SurgeryFileStorageService.StoredSurgeryFile stored =
                            surgeryFileStorageService.storeIconFile(detail.getMiddleCategory().getGroupType(), detail.getId(), replaceFile);
                    icon.changeImage(stored.imageUrl(), stored.relativePath(), stored.originalName());
                }
                continue;
            }

            if (deleted) {
                continue;
            }

            MultipartFile newFile = multipartRequest.getFile("iconFile__" + item.getClientKey());
            if (newFile == null || newFile.isEmpty()) {
                if (createMode) {
                    throw new IllegalArgumentException("새 icon 이미지가 누락되었습니다.");
                }
                continue;
            }

            SurgeryFileStorageService.StoredSurgeryFile stored =
                    surgeryFileStorageService.storeIconFile(detail.getMiddleCategory().getGroupType(), detail.getId(), newFile);

            detailIconRepository.save(new SurgeryDetailIcon(
                    detail,
                    normalize(item.getTitle()),
                    normalize(item.getDescriptionText()),
                    stored.imageUrl(),
                    stored.relativePath(),
                    stored.originalName(),
                    safeOrder(item.getDisplayOrder(), i)
            ));
        }
    }

    private SurgeryMiddleCategory getValidatedMiddle(SurgeryGroupType groupType, Long middleCategoryId) {
        SurgeryMiddleCategory middle = middleCategoryRepository.findById(middleCategoryId)
                .orElseThrow(() -> new IllegalArgumentException("중분류를 찾을 수 없습니다."));

        if (middle.getGroupType() != groupType) {
            throw new IllegalArgumentException("선택한 중분류가 현재 대분류와 일치하지 않습니다.");
        }
        return middle;
    }

    private void validateSameIds(List<Long> dbIds, List<Long> requestIds) {
        if (dbIds.size() != requestIds.size() || !new HashSet<>(dbIds).equals(new HashSet<>(requestIds))) {
            throw new IllegalArgumentException("정렬 대상 ID 목록이 올바르지 않습니다.");
        }
    }

    private String normalize(String value) {
        if (!StringUtils.hasText(value)) {
            throw new IllegalArgumentException("필수값이 비어 있습니다.");
        }
        return value.trim();
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private int safeOrder(Integer order, int fallback) {
        return order == null ? fallback : order;
    }
}