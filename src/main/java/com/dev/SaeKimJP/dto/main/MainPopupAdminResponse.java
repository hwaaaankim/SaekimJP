package com.dev.SaeKimJP.dto.main;
import java.time.LocalDate;

import com.dev.SaeKimJP.model.main.MainPopup;
import com.dev.SaeKimJP.util.FrontPagePathUtils;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MainPopupAdminResponse {

    private Long id;
    private String imageUrl;
    private String linkUrl;
    private Integer displayOrder;
    private Boolean useDisplayPeriod;
    private LocalDate displayStartDate;
    private LocalDate displayEndDate;
    private Boolean currentlyVisible;

    public static MainPopupAdminResponse from(MainPopup entity) {
        return MainPopupAdminResponse.builder()
                .id(entity.getId())
                .imageUrl(hasText(entity.getImageUrl()) ? entity.getImageUrl() : "/front/resources/images/placeholder-450-700.svg")
                .linkUrl(FrontPagePathUtils.normalizeInternalPagePath(entity.getLinkUrl()))
                .displayOrder(entity.getDisplayOrder())
                .useDisplayPeriod(Boolean.TRUE.equals(entity.getUseDisplayPeriod()))
                .displayStartDate(entity.getDisplayStartDate())
                .displayEndDate(entity.getDisplayEndDate())
                .currentlyVisible(isCurrentlyVisible(entity))
                .build();
    }

    private static boolean isCurrentlyVisible(MainPopup entity) {
        LocalDate today = LocalDate.now();

        if (!Boolean.TRUE.equals(entity.getUseDisplayPeriod())) {
            return true;
        }

        if (entity.getDisplayStartDate() == null || entity.getDisplayEndDate() == null) {
            return false;
        }

        return !today.isBefore(entity.getDisplayStartDate()) && !today.isAfter(entity.getDisplayEndDate());
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}