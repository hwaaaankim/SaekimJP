package com.dev.SaeKimJP.service.beforeAfter;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterImageSlot;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Service
public class BeforeAfterFileStoreService {

    @Value("${spring.upload.path}")
    private String uploadPath;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final int TARGET_WIDTH = 420;
    private static final int TARGET_HEIGHT = 500;

    public StoredFileInfo store(Long beforeAfterId, MultipartFile file, BeforeAfterImageSlot slot) {
        validateImageFile(file);

        String datePath = LocalDate.now().format(DATE_FORMATTER);
        String savedFileName = slot.getFilePrefix() + "-" + UUID.randomUUID().toString().replace("-", "") + ".jpg";

        try {
            Path dirPath = Paths.get(uploadPath, "before-after", String.valueOf(beforeAfterId), datePath);
            Files.createDirectories(dirPath);

            Path targetPath = dirPath.resolve(savedFileName);

            BufferedImage sourceImage = ImageIO.read(file.getInputStream());

            if (sourceImage == null) {
                throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다.");
            }

            BufferedImage resizedImage = resizeToTarget(sourceImage);
            boolean written = ImageIO.write(resizedImage, "jpg", targetPath.toFile());

            if (!written) {
                throw new RuntimeException("전후사진 이미지 저장 형식을 처리할 수 없습니다.");
            }

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

    private BufferedImage resizeToTarget(BufferedImage sourceImage) {
        BufferedImage targetImage = new BufferedImage(TARGET_WIDTH, TARGET_HEIGHT, BufferedImage.TYPE_INT_RGB);

        Graphics2D graphics = targetImage.createGraphics();

        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
            graphics.drawImage(sourceImage, 0, 0, TARGET_WIDTH, TARGET_HEIGHT, null);
        } finally {
            graphics.dispose();
        }

        return targetImage;
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

    @Getter
    @AllArgsConstructor
    public static class StoredFileInfo {
        private String originalFilename;
        private String fullPath;
        private String url;
    }
}