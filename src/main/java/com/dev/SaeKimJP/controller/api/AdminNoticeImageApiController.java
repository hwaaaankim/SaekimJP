package com.dev.SaeKimJP.controller.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/notices")
public class AdminNoticeImageApiController {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp"
    );

    @Value("${spring.upload.path}")
    private String commonPath;

    @PostMapping("/editor-image")
    public ResponseEntity<Map<String, Object>> uploadEditorImage(
            @RequestParam("upload") MultipartFile file
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("jpg, png, gif, webp 이미지만 업로드할 수 있습니다.");
        }

        String originalFilename = file.getOriginalFilename();
        String ext = getExtension(originalFilename);
        if (!StringUtils.hasText(ext)) {
            throw new IllegalArgumentException("파일 확장자를 확인할 수 없습니다.");
        }

        String datePath = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String relativeDir = "notice/editor/" + datePath;
        Path uploadDir = Paths.get(commonPath, relativeDir);

        Files.createDirectories(uploadDir);

        String savedFileName = UUID.randomUUID() + "." + ext.toLowerCase();
        Path savedPath = uploadDir.resolve(savedFileName);

        file.transferTo(savedPath.toFile());

        String url = "/administration/upload/" + relativeDir + "/" + savedFileName;

        return ResponseEntity.ok(Map.of(
                "uploaded", true,
                "url", url
        ));
    }

    private String getExtension(String filename) {
        if (!StringUtils.hasText(filename) || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}