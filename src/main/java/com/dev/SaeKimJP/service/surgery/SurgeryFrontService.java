package com.dev.SaeKimJP.service.surgery;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dev.SaeKimJP.dto.surgery.FrontSurgeryDetailDto;
import com.dev.SaeKimJP.dto.surgery.FrontSurgeryIconDto;
import com.dev.SaeKimJP.dto.surgery.FrontSurgeryMiddleDto;
import com.dev.SaeKimJP.dto.surgery.FrontSurgeryPageResponse;
import com.dev.SaeKimJP.dto.surgery.FrontSurgeryPreviewImageDto;
import com.dev.SaeKimJP.dto.surgery.FrontSurgeryStepDto;
import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.model.surgery.SurgeryMiddleCategory;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailCategoryRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailIconRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryDetailStepRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryMiddleCategoryRepository;
import com.dev.SaeKimJP.repository.surgery.SurgeryPreviewImageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SurgeryFrontService {

    private final SurgeryPreviewImageRepository previewImageRepository;
    private final SurgeryMiddleCategoryRepository middleCategoryRepository;
    private final SurgeryDetailCategoryRepository detailCategoryRepository;
    private final SurgeryDetailStepRepository detailStepRepository;
    private final SurgeryDetailIconRepository detailIconRepository;

    public FrontSurgeryPageResponse getPage(SurgeryGroupType groupType) {
        List<FrontSurgeryPreviewImageDto> previewImages = previewImageRepository
                .findByGroupTypeAndActiveTrueOrderByDisplayOrderAscIdAsc(groupType)
                .stream()
                .map(it -> new FrontSurgeryPreviewImageDto(
                        it.getId(),
                        it.getImageUrl(),
                        it.getAltText()
                ))
                .toList();

        List<SurgeryMiddleCategory> middles =
                middleCategoryRepository.findByGroupTypeAndActiveTrueOrderByDisplayOrderAscIdAsc(groupType);

        List<FrontSurgeryMiddleDto> middleDtos = new ArrayList<>();
        List<String> tags = new ArrayList<>();

        for (SurgeryMiddleCategory middle : middles) {
            tags.add(middle.getName());

            List<FrontSurgeryDetailDto> detailDtos = detailCategoryRepository
                    .findByMiddleCategory_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(middle.getId())
                    .stream()
                    .map(detail -> {
                        List<FrontSurgeryStepDto> steps = detailStepRepository
                                .findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detail.getId())
                                .stream()
                                .map(step -> new FrontSurgeryStepDto(
                                        step.getId(),
                                        step.getTitle(),
                                        step.getDescriptionText(),
                                        step.getImageUrl(),
                                        step.getDisplayOrder()
                                ))
                                .toList();

                        List<FrontSurgeryIconDto> icons = detailIconRepository
                                .findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(detail.getId())
                                .stream()
                                .map(icon -> new FrontSurgeryIconDto(
                                        icon.getId(),
                                        icon.getTitle(),
                                        icon.getDescriptionText(),
                                        icon.getImageUrl(),
                                        icon.getDisplayOrder()
                                ))
                                .toList();

                        return new FrontSurgeryDetailDto(
                                detail.getId(),
                                detail.getName(),
                                detail.getIntroText(),
                                detail.getDisplayOrder() + 1,
                                steps,
                                icons
                        );
                    })
                    .toList();

            middleDtos.add(new FrontSurgeryMiddleDto(
                    middle.getId(),
                    middle.getName(),
                    middle.getIntroText(),
                    detailDtos
            ));
        }

        return new FrontSurgeryPageResponse(
                groupType.name(),
                groupType.getLabel(),
                tags.stream().distinct().limit(6).toList(),
                previewImages,
                middleDtos
        );
    }
}