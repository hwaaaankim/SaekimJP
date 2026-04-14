package com.dev.SaeKimJP.service.main;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MainPageFileStorageService {

    private static final String URL_PREFIX = "/administration/upload/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Value("${spring.upload.path}")
    private String uploadRootPath;

    @Value("${spring.upload.env}")
    private String uploadEnv;

    /**
     * 메인배너 PC 이미지 저장
     * 저장 위치:
     * {spring.upload.path}/main-banner/{bannerId}/{yyyy-MM-dd}/{fileName}
     *
     * 접근 URL:
     * /administration/upload/main-banner/{bannerId}/{yyyy-MM-dd}/{fileName}
     */
    public StoredFile storeMainBannerPc(Long bannerId, MultipartFile file) {
        return store("main-banner", bannerId, file);
    }

    /**
     * 메인배너 모바일 이미지 저장
     * 저장 위치:
     * {spring.upload.path}/main-banner/{bannerId}/{yyyy-MM-dd}/{fileName}
     *
     * 접근 URL:
     * /administration/upload/main-banner/{bannerId}/{yyyy-MM-dd}/{fileName}
     */
    public StoredFile storeMainBannerMobile(Long bannerId, MultipartFile file) {
        return store("main-banner", bannerId, file);
    }

    /**
     * 팝업 이미지 저장
     * 저장 위치:
     * {spring.upload.path}/popup/{popupId}/{yyyy-MM-dd}/{fileName}
     *
     * 접근 URL:
     * /administration/upload/popup/{popupId}/{yyyy-MM-dd}/{fileName}
     */
    public StoredFile storePopupImage(Long popupId, MultipartFile file) {
        return store("popup", popupId, file);
    }

    /**
     * 저장된 URL 기준으로 실제 파일 삭제
     * 예:
     * /administration/upload/main-banner/1/2026-04-14/xxx.jpg
     * -> {spring.upload.path}/main-banner/1/2026-04-14/xxx.jpg 삭제
     */
    public void deleteByUrl(String fileUrl) {
        if (!StringUtils.hasText(fileUrl)) {
            return;
        }

        try {
            String normalizedUrl = fileUrl.replace("\\", "/").trim();

            int prefixIndex = normalizedUrl.indexOf(URL_PREFIX);
            if (prefixIndex < 0) {
                return;
            }

            String relativePath = normalizedUrl.substring(prefixIndex + URL_PREFIX.length());
            if (!StringUtils.hasText(relativePath)) {
                return;
            }

            Path targetPath = Paths.get(uploadRootPath).resolve(relativePath).normalize();
            Files.deleteIfExists(targetPath);
        } catch (Exception ignored) {
            // 삭제 실패해도 전체 로직이 죽지 않도록 무시
            // 필요시 여기 로그만 추가하시면 됩니다.
        }
    }

    private StoredFile store(String category, Long ownerId, MultipartFile file) {
        validateFile(file);

        try {
            String datePath = LocalDate.now().format(DATE_FORMATTER);

            String originalFilename = cleanOriginalFilename(file.getOriginalFilename());
            String extension = StringUtils.getFilenameExtension(originalFilename);

            String savedFilename = UUID.randomUUID().toString().replace("-", "");
            if (StringUtils.hasText(extension)) {
                savedFilename += "." + extension.toLowerCase();
            }

            Path saveDirectory = Paths.get(uploadRootPath, category, String.valueOf(ownerId), datePath).normalize();
            Files.createDirectories(saveDirectory);

            Path targetFile = saveDirectory.resolve(savedFilename).normalize();
            file.transferTo(targetFile.toFile());

            String accessUrl = URL_PREFIX + category + "/" + ownerId + "/" + datePath + "/" + savedFilename;

            return new StoredFile(accessUrl, originalFilename, targetFile.toString());
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 중 오류가 발생했습니다.", e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }
    }

    private String cleanOriginalFilename(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return "unknown";
        }

        String cleaned = Paths.get(originalFilename).getFileName().toString();
        return cleaned.replaceAll("[\\r\\n]", "");
    }

    public record StoredFile(
            String url,
            String originalName,
            String absolutePath
    ) {
    }
}