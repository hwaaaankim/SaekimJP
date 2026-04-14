package com.dev.SaeKimJP.service.main;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.dto.main.DisplayOrderUpdateRequest;
import com.dev.SaeKimJP.dto.main.FrontMainBannerResponse;
import com.dev.SaeKimJP.dto.main.MainBannerAdminResponse;
import com.dev.SaeKimJP.dto.main.MainBannerUpsertRequest;
import com.dev.SaeKimJP.model.main.MainBanner;
import com.dev.SaeKimJP.repository.main.MainBannerRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class MainBannerService {

    private static final String TEMP_IMAGE_URL = "__TEMP__";

    private final MainBannerRepository mainBannerRepository;
    private final MainPageFileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<MainBannerAdminResponse> getAdminList() {
        return mainBannerRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(MainBannerAdminResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FrontMainBannerResponse> getFrontList() {
        List<FrontMainBannerResponse> list = mainBannerRepository.findAllByOrderByDisplayOrderAscIdAsc()
                .stream()
                .map(FrontMainBannerResponse::from)
                .collect(Collectors.toList());

        if (list.isEmpty()) {
            return List.of(FrontMainBannerResponse.fallback());
        }

        return list;
    }

    public MainBannerAdminResponse create(MainBannerUpsertRequest request) {
        MultipartFile pcImage = request.getPcImage();
        MultipartFile mobileImage = request.getMobileImage();

        if (pcImage == null || pcImage.isEmpty()) {
            throw new IllegalArgumentException("PC용 이미지는 필수입니다.");
        }

        MainBanner entity = new MainBanner();
        entity.setGeneralText(trimToNull(request.getGeneralText()));
        entity.setStrongText(trimToNull(request.getStrongText()));
        entity.setDisplayOrder(999999);

        // not-null 제약 회피용 임시값
        entity.setPcImageUrl(TEMP_IMAGE_URL);
        entity.setPcImageOriginalName(defaultString(pcImage.getOriginalFilename(), "temp"));

        entity = mainBannerRepository.save(entity);

        String storedPcUrl = null;
        String storedMobileUrl = null;

        try {
            MainPageFileStorageService.StoredFile pcStored =
                    fileStorageService.storeMainBannerPc(entity.getId(), pcImage);

            storedPcUrl = pcStored.url();
            entity.setPcImageUrl(pcStored.url());
            entity.setPcImageOriginalName(pcStored.originalName());

            if (mobileImage != null && !mobileImage.isEmpty()) {
                MainPageFileStorageService.StoredFile mobileStored =
                        fileStorageService.storeMainBannerMobile(entity.getId(), mobileImage);

                storedMobileUrl = mobileStored.url();
                entity.setMobileImageUrl(mobileStored.url());
                entity.setMobileImageOriginalName(mobileStored.originalName());
            } else {
                entity.setMobileImageUrl(null);
                entity.setMobileImageOriginalName(null);
            }

            applyDisplayOrder(entity, request.getDisplayOrder());
            return MainBannerAdminResponse.from(entity);

        } catch (Exception e) {
            safeDeleteByUrl(storedPcUrl);
            safeDeleteByUrl(storedMobileUrl);
            throw new IllegalStateException("메인배너 저장 중 오류가 발생했습니다.", e);
        }
    }

    public MainBannerAdminResponse update(Long id, MainBannerUpsertRequest request) {
        MainBanner entity = mainBannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메인배너를 찾을 수 없습니다."));

        entity.setGeneralText(trimToNull(request.getGeneralText()));
        entity.setStrongText(trimToNull(request.getStrongText()));

        if (request.getPcImage() != null && !request.getPcImage().isEmpty()) {
            String oldPcUrl = entity.getPcImageUrl();

            MainPageFileStorageService.StoredFile stored =
                    fileStorageService.storeMainBannerPc(entity.getId(), request.getPcImage());

            entity.setPcImageUrl(stored.url());
            entity.setPcImageOriginalName(stored.originalName());

            safeDeleteByUrl(oldPcUrl);
        }

        if (request.getMobileImage() != null && !request.getMobileImage().isEmpty()) {
            String oldMobileUrl = entity.getMobileImageUrl();

            MainPageFileStorageService.StoredFile stored =
                    fileStorageService.storeMainBannerMobile(entity.getId(), request.getMobileImage());

            entity.setMobileImageUrl(stored.url());
            entity.setMobileImageOriginalName(stored.originalName());

            safeDeleteByUrl(oldMobileUrl);
        }

        if (Boolean.TRUE.equals(request.getRemoveMobileImage())) {
            String oldMobileUrl = entity.getMobileImageUrl();
            entity.setMobileImageUrl(null);
            entity.setMobileImageOriginalName(null);
            safeDeleteByUrl(oldMobileUrl);
        }

        applyDisplayOrder(entity, request.getDisplayOrder());

        return MainBannerAdminResponse.from(entity);
    }

    public void delete(Long id) {
        MainBanner entity = mainBannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("메인배너를 찾을 수 없습니다."));

        safeDeleteByUrl(entity.getPcImageUrl());
        safeDeleteByUrl(entity.getMobileImageUrl());

        mainBannerRepository.delete(entity);
        normalizeDisplayOrder();
    }

    public void updateDisplayOrders(List<DisplayOrderUpdateRequest> requestList) {
        List<MainBanner> all = mainBannerRepository.findAllByOrderByDisplayOrderAscIdAsc();
        all.sort(Comparator.comparing(MainBanner::getDisplayOrder).thenComparing(MainBanner::getId));

        for (DisplayOrderUpdateRequest request : requestList) {
            for (MainBanner entity : all) {
                if (entity.getId().equals(request.getId())) {
                    entity.setDisplayOrder(request.getDisplayOrder());
                    break;
                }
            }
        }

        all.sort(Comparator.comparing(MainBanner::getDisplayOrder).thenComparing(MainBanner::getId));

        int order = 1;
        for (MainBanner entity : all) {
            entity.setDisplayOrder(order++);
        }

        mainBannerRepository.saveAll(all);
    }

    private void applyDisplayOrder(MainBanner target, Integer requestedOrder) {
        List<MainBanner> all = new ArrayList<>(mainBannerRepository.findAllByOrderByDisplayOrderAscIdAsc());
        all.removeIf(item -> item.getId().equals(target.getId()));

        int targetOrder = requestedOrder == null ? all.size() + 1 : requestedOrder;
        int insertIndex = Math.max(0, Math.min(targetOrder - 1, all.size()));

        all.add(insertIndex, target);

        int order = 1;
        for (MainBanner entity : all) {
            entity.setDisplayOrder(order++);
        }

        mainBannerRepository.saveAll(all);
    }

    private void normalizeDisplayOrder() {
        List<MainBanner> all = mainBannerRepository.findAllByOrderByDisplayOrderAscIdAsc();
        int order = 1;
        for (MainBanner entity : all) {
            entity.setDisplayOrder(order++);
        }
        mainBannerRepository.saveAll(all);
    }

    private void safeDeleteByUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return;
        }
        if (TEMP_IMAGE_URL.equals(url)) {
            return;
        }

        try {
            fileStorageService.deleteByUrl(url);
        } catch (Exception ignored) {
        }
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }

    private String defaultString(String value, String defaultValue) {
        return StringUtils.hasText(value) ? value : defaultValue;
    }
}