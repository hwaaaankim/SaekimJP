package com.dev.SaeKimJP.service.main;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.dev.SaeKimJP.dto.main.DisplayOrderUpdateRequest;
import com.dev.SaeKimJP.dto.main.FrontMainPopupResponse;
import com.dev.SaeKimJP.dto.main.MainPopupAdminResponse;
import com.dev.SaeKimJP.dto.main.MainPopupUpsertRequest;
import com.dev.SaeKimJP.model.main.MainPopup;
import com.dev.SaeKimJP.repository.main.MainPopupRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MainPopupService {

    private final MainPopupRepository mainPopupRepository;
    private final MainPageFileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<MainPopupAdminResponse> getAdminList() {
        return mainPopupRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(MainPopupAdminResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FrontMainPopupResponse> getFrontVisibleList() {
        LocalDate today = LocalDate.now();

        return mainPopupRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .filter(popup -> isVisibleOnDate(popup, today))
                .map(FrontMainPopupResponse::from)
                .collect(Collectors.toList());
    }

    public MainPopupAdminResponse create(MainPopupUpsertRequest request) {
        validatePeriod(request);

        if (request.getImage() == null || request.getImage().isEmpty()) {
            throw new IllegalArgumentException("팝업 이미지는 필수입니다.");
        }

        MainPopup entity = new MainPopup();
        entity.setLinkUrl(trimToNull(request.getLinkUrl()));
        entity.setUseDisplayPeriod(Boolean.TRUE.equals(request.getUseDisplayPeriod()));
        entity.setDisplayStartDate(Boolean.TRUE.equals(request.getUseDisplayPeriod()) ? request.getDisplayStartDate() : null);
        entity.setDisplayEndDate(Boolean.TRUE.equals(request.getUseDisplayPeriod()) ? request.getDisplayEndDate() : null);
        entity.setDisplayOrder(999999);

        // 중요: imageUrl NOT NULL 제약 때문에 임시값 선세팅
        entity.setImageUrl("TEMP");
        entity.setImageOriginalName("TEMP");

        entity = mainPopupRepository.save(entity);

        MainPageFileStorageService.StoredFile stored =
                fileStorageService.storePopupImage(entity.getId(), request.getImage());

        entity.setImageUrl(stored.url());
        entity.setImageOriginalName(stored.originalName());

        applyDisplayOrder(entity, request.getDisplayOrder());

        return MainPopupAdminResponse.from(entity);
    }

    public MainPopupAdminResponse update(Long id, MainPopupUpsertRequest request) {
        validatePeriod(request);

        MainPopup entity = mainPopupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다."));

        entity.setLinkUrl(trimToNull(request.getLinkUrl()));
        entity.setUseDisplayPeriod(Boolean.TRUE.equals(request.getUseDisplayPeriod()));

        if (Boolean.TRUE.equals(request.getUseDisplayPeriod())) {
            entity.setDisplayStartDate(request.getDisplayStartDate());
            entity.setDisplayEndDate(request.getDisplayEndDate());
        } else {
            entity.setDisplayStartDate(null);
            entity.setDisplayEndDate(null);
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String oldImageUrl = entity.getImageUrl();

            MainPageFileStorageService.StoredFile stored =
                    fileStorageService.storePopupImage(entity.getId(), request.getImage());

            entity.setImageUrl(stored.url());
            entity.setImageOriginalName(stored.originalName());

            fileStorageService.deleteByUrl(oldImageUrl);
        }

        applyDisplayOrder(entity, request.getDisplayOrder());

        return MainPopupAdminResponse.from(entity);
    }

    public void delete(Long id) {
        MainPopup entity = mainPopupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팝업을 찾을 수 없습니다."));

        fileStorageService.deleteByUrl(entity.getImageUrl());

        mainPopupRepository.delete(entity);
        normalizeDisplayOrder();
    }

    public void updateDisplayOrders(List<DisplayOrderUpdateRequest> requestList) {
        List<MainPopup> all = mainPopupRepository.findAllByOrderByDisplayOrderAscIdAsc();
        all.sort(Comparator.comparing(MainPopup::getDisplayOrder).thenComparing(MainPopup::getId));

        for (DisplayOrderUpdateRequest request : requestList) {
            for (MainPopup entity : all) {
                if (entity.getId().equals(request.getId())) {
                    entity.setDisplayOrder(request.getDisplayOrder());
                    break;
                }
            }
        }

        all.sort(Comparator.comparing(MainPopup::getDisplayOrder).thenComparing(MainPopup::getId));

        int order = 1;
        for (MainPopup entity : all) {
            entity.setDisplayOrder(order++);
        }

        mainPopupRepository.saveAll(all);
    }

    private void applyDisplayOrder(MainPopup target, Integer requestedOrder) {
        List<MainPopup> all = new ArrayList<>(mainPopupRepository.findAllByOrderByDisplayOrderAscIdAsc());
        all.removeIf(item -> item.getId().equals(target.getId()));

        int targetOrder = requestedOrder == null ? all.size() + 1 : requestedOrder;
        int insertIndex = Math.max(0, Math.min(targetOrder - 1, all.size()));

        all.add(insertIndex, target);

        int order = 1;
        for (MainPopup entity : all) {
            entity.setDisplayOrder(order++);
        }

        mainPopupRepository.saveAll(all);
    }

    private void normalizeDisplayOrder() {
        List<MainPopup> all = mainPopupRepository.findAllByOrderByDisplayOrderAscIdAsc();
        int order = 1;
        for (MainPopup entity : all) {
            entity.setDisplayOrder(order++);
        }
        mainPopupRepository.saveAll(all);
    }

    private void validatePeriod(MainPopupUpsertRequest request) {
        boolean useDisplayPeriod = Boolean.TRUE.equals(request.getUseDisplayPeriod());

        if (!useDisplayPeriod) {
            return;
        }

        if (request.getDisplayStartDate() == null || request.getDisplayEndDate() == null) {
            throw new IllegalArgumentException("노출 날짜 지정을 사용하는 경우 시작일과 종료일은 필수입니다.");
        }

        if (request.getDisplayEndDate().isBefore(request.getDisplayStartDate())) {
            throw new IllegalArgumentException("종료일은 시작일보다 빠를 수 없습니다.");
        }
    }

    private boolean isVisibleOnDate(MainPopup popup, LocalDate targetDate) {
        if (!Boolean.TRUE.equals(popup.getUseDisplayPeriod())) {
            return true;
        }

        if (popup.getDisplayStartDate() == null || popup.getDisplayEndDate() == null) {
            return false;
        }

        return !targetDate.isBefore(popup.getDisplayStartDate()) && !targetDate.isAfter(popup.getDisplayEndDate());
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}