package com.dev.SaeKimJP.service.main;

import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.dev.SaeKimJP.dto.main.*;
import com.dev.SaeKimJP.model.main.AboutBanner;
import com.dev.SaeKimJP.repository.main.AboutBannerRepository;
import lombok.RequiredArgsConstructor;

@Service @RequiredArgsConstructor
public class AboutBannerService {
    public static final String DEFAULT_IMAGE = "/front/images/main/6.png";
    public static final String DEFAULT_TITLE = "セギム整形外科は、\n美しさはもちろん、\n患者様の安全にも配慮しています。";
    public static final String DEFAULT_BODY = "時を重ねても自然な美しさを大切にし、\n合併症のリスク軽減に努めた手術をご提供します。";
    private final AboutBannerRepository repository;
    private final MainPageFileStorageService storage;

    @Transactional(readOnly = true)
    public AboutBannerResponse get() {
        return repository.findById(1L).map(this::response).orElseGet(() ->
            new AboutBannerResponse(DEFAULT_TITLE, DEFAULT_BODY, DEFAULT_IMAGE, null, false, -1L));
    }

    @Transactional
    public AboutBannerResponse save(AboutBannerRequest request) {
        String title = normalize(request.getTitleText(), 2000, "큰 문구");
        String body = normalize(request.getBodyText(), 4000, "작은 문구");
        MultipartFile image = request.getImage();
        boolean upload = image != null && !image.isEmpty();
        if (upload && request.isRemoveImage()) throw new IllegalArgumentException("이미지 교체와 삭제는 동시에 선택할 수 없습니다.");
        if (upload) validateImage(image);
        AboutBanner entity = repository.findById(1L).orElseGet(AboutBanner::new);
        long current = entity.getVersion() == null ? -1L : entity.getVersion();
        if (request.getVersion() == null || request.getVersion() != current)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "다른 관리자가 변경했습니다. 내용을 복사해 두고 새로 조회해 주세요.");
        entity.setTitleText(title);
        entity.setBodyText(body);
        String oldUrl = entity.getImageUrl();
        if (upload) {
            var stored = storage.storeAboutBanner(image);
            // A DB rollback removes only the new upload; commit removes only the previous upload.
            cleanupAfterTransaction(stored.url(), oldUrl);
            entity.setImageUrl(stored.url());
            entity.setImageOriginalName(stored.originalName());
        } else if (request.isRemoveImage()) {
            cleanupAfterTransaction(null, oldUrl);
            entity.setImageUrl(null);
            entity.setImageOriginalName(null);
        }
        return response(repository.saveAndFlush(entity));
    }

    private AboutBannerResponse response(AboutBanner entity) {
        boolean custom = StringUtils.hasText(entity.getImageUrl());
        return new AboutBannerResponse(entity.getTitleText(), entity.getBodyText(),
            custom ? entity.getImageUrl() : DEFAULT_IMAGE, entity.getImageOriginalName(), custom, entity.getVersion());
    }
    private String normalize(String value, int max, String label) {
        if (value == null) throw new IllegalArgumentException(label + " 항목이 누락되었습니다.");
        String text = value.replace("\r\n", "\n").replace('\r', '\n');
        if (text.length() > max) throw new IllegalArgumentException(label + "는 " + max + "자 이내로 입력해 주세요.");
        if (text.indexOf('\0') >= 0) throw new IllegalArgumentException("사용할 수 없는 문자가 포함되어 있습니다.");
        return text;
    }
    private void validateImage(MultipartFile image) {
        String ext = StringUtils.getFilenameExtension(image.getOriginalFilename());
        String mime = image.getContentType();
        if (ext == null || !Set.of("jpg", "jpeg", "png", "webp").contains(ext.toLowerCase(Locale.ROOT))
            || mime == null || !Set.of("image/jpeg", "image/png", "image/webp").contains(mime))
            throw new IllegalArgumentException("JPG, PNG, WEBP 이미지 파일만 등록할 수 있습니다.");
        if (image.getSize() > 10 * 1024 * 1024) throw new IllegalArgumentException("이미지는 10MB 이하로 등록해 주세요.");
        try (var input = image.getInputStream()) {
            byte[] b = input.readNBytes(12);
            boolean jpg = b.length >= 3 && (b[0]&255)==255 && (b[1]&255)==216 && (b[2]&255)==255;
            boolean png = b.length >= 8 && b[0]==(byte)137 && b[1]==80 && b[2]==78 && b[3]==71 && b[4]==13 && b[5]==10 && b[6]==26 && b[7]==10;
            boolean webp = b.length >= 12 && b[0]==82 && b[1]==73 && b[2]==70 && b[3]==70 && b[8]==87 && b[9]==69 && b[10]==66 && b[11]==80;
            if (!(jpg && Set.of("jpg","jpeg").contains(ext.toLowerCase(Locale.ROOT)) && mime.equals("image/jpeg")
                || png && ext.equalsIgnoreCase("png") && mime.equals("image/png")
                || webp && ext.equalsIgnoreCase("webp") && mime.equals("image/webp")))
                throw new IllegalArgumentException("이미지 파일 형식이 올바르지 않습니다.");
        } catch (java.io.IOException e) { throw new IllegalArgumentException("이미지 파일을 읽을 수 없습니다."); }
    }
    private void cleanupAfterTransaction(String newUrl, String oldUrl) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCompletion(int status) {
                String obsolete = status == STATUS_COMMITTED ? oldUrl : newUrl;
                if (obsolete != null && obsolete.startsWith("/administration/upload/about-banner/1/"))
                    storage.deleteByUrl(obsolete);
            }
        });
    }
}
