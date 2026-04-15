package com.dev.SaeKimJP.service.beforeAfter;

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

import lombok.AllArgsConstructor;
import lombok.Getter;

@Service
public class BeforeAfterFileStoreService {

    @Value("${spring.upload.path}")
    private String uploadPath;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public StoredFileInfo store(Long beforeAfterId, MultipartFile file, String slotName) {
        validateImageFile(file);

        String datePath = LocalDate.now().format(DATE_FORMATTER);
        String extension = getExtension(file.getOriginalFilename());
        String savedFileName = slotName + "-" + UUID.randomUUID().toString().replace("-", "")
                + (extension.isEmpty() ? "" : "." + extension);

        try {
            Path dirPath = Paths.get(uploadPath, "before-after", String.valueOf(beforeAfterId), datePath);
            Files.createDirectories(dirPath);

            Path targetPath = dirPath.resolve(savedFileName);
            file.transferTo(targetPath.toFile());

            String url = "/upload/before-after/" + beforeAfterId + "/" + datePath + "/" + savedFileName;

            return new StoredFileInfo(
                    file.getOriginalFilename(),
                    targetPath.toAbsolutePath().toString(),
                    url
            );
        } catch (IOException e) {
            throw new RuntimeException("전후사진 이미지 저장 중 오류가 발생했습니다.", e);
        }
    }

    public void deleteQuietly(String fullPath) {
        if (!StringUtils.hasText(fullPath)) {
            return;
        }

        try {
            Path filePath = Paths.get(fullPath);
            Files.deleteIfExists(filePath);

            Path uploadRoot = Paths.get(uploadPath).toAbsolutePath().normalize();
            Path current = filePath.getParent();

            while (current != null && !current.equals(uploadRoot)) {
                if (Files.exists(current) && Files.isDirectory(current) && isDirectoryEmpty(current)) {
                    Files.deleteIfExists(current);
                    current = current.getParent();
                } else {
                    break;
                }
            }
        } catch (Exception ignored) {
        }
    }

    private boolean isDirectoryEmpty(Path directory) throws IOException {
        try (var stream = Files.list(directory)) {
            return stream.findAny().isEmpty();
        }
    }

    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 비어 있습니다.");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }
    }

    private String getExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename) || !originalFilename.contains(".")) {
            return "";
        }
        return originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
    }

    @Getter
    @AllArgsConstructor
    public static class StoredFileInfo {
        private String originalFilename;
        private String fullPath;
        private String url;
    }
}