package com.dev.SaeKimJP.service.surgery;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;

@Service
public class SurgeryFileStorageService {

    @Value("${spring.upload.path}")
    private String uploadRootPath;

    public StoredSurgeryFile storePreviewFile(SurgeryGroupType groupType, MultipartFile file) {
        return store(groupType, "preview", file);
    }

    public StoredSurgeryFile storeStepFile(SurgeryGroupType groupType, Long detailId, MultipartFile file) {
        return store(groupType, "step/" + detailId, file);
    }

    public StoredSurgeryFile storeIconFile(SurgeryGroupType groupType, Long detailId, MultipartFile file) {
        return store(groupType, "icon/" + detailId, file);
    }

    private StoredSurgeryFile store(SurgeryGroupType groupType, String folder, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드 파일이 비어 있습니다.");
        }

        String originalName = StringUtils.hasText(file.getOriginalFilename())
                ? file.getOriginalFilename().trim()
                : "file";

        String ext = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            ext = originalName.substring(dotIndex);
        }

        String datePath = LocalDate.now().toString();
        String groupPath = groupType.name().toLowerCase();
        String relativeDir = "surgery/" + groupPath + "/" + folder + "/" + datePath;
        String saveName = UUID.randomUUID().toString().replace("-", "") + ext;

        Path dir = Paths.get(uploadRootPath, relativeDir);
        Path target = dir.resolve(saveName);

        try {
            Files.createDirectories(dir);
            file.transferTo(target.toFile());
        } catch (IOException e) {
            throw new IllegalStateException("파일 저장에 실패했습니다.", e);
        }

        String relativePath = (relativeDir + "/" + saveName).replace("\\", "/");

        return new StoredSurgeryFile(
                "/upload/" + relativePath,
                relativePath,
                originalName
        );
    }

    public void deleteQuietly(String relativePath) {
        if (!StringUtils.hasText(relativePath)) {
            return;
        }

        try {
            Path fullPath = Paths.get(uploadRootPath, relativePath);
            Files.deleteIfExists(fullPath);
        } catch (Exception ignored) {
        }
    }

    public record StoredSurgeryFile(
            String imageUrl,
            String relativePath,
            String originalName
    ) {
    }
}