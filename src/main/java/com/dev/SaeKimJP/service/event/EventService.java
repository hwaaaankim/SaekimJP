package com.dev.SaeKimJP.service.event;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.dev.SaeKimJP.dto.event.AdminEventCardResponse;
import com.dev.SaeKimJP.dto.event.AdminEventDetailResponse;
import com.dev.SaeKimJP.dto.event.AdminEventSaveRequest;
import com.dev.SaeKimJP.dto.event.FrontEventCursorResponse;
import com.dev.SaeKimJP.dto.event.FrontEventIndexResponse;
import com.dev.SaeKimJP.dto.event.FrontEventListItemResponse;
import com.dev.SaeKimJP.enums.event.EventFrontFilterStatus;
import com.dev.SaeKimJP.enums.event.EventManualProgressStatus;
import com.dev.SaeKimJP.model.event.Event;
import com.dev.SaeKimJP.repository.event.EventRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {

    private final EventRepository eventRepository;

    @Value("${spring.upload.path}")
    private String uploadPath;

    private static final DateTimeFormatter DATE_FOLDER_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd HH:mm");

    @Transactional(readOnly = true)
    public List<AdminEventCardResponse> getAdminEventList() {
        LocalDate today = LocalDate.now();

        return eventRepository.findAllByOrderByIdDesc().stream()
                .map(event -> AdminEventCardResponse.from(event, today, DATE_TIME_FORMATTER))
                .toList();
    }

    @Transactional(readOnly = true)
    public AdminEventDetailResponse getAdminEventDetail(Long id) {
        Event event = getEvent(id);
        return AdminEventDetailResponse.from(event, LocalDate.now(), DATE_TIME_FORMATTER);
    }

    public AdminEventDetailResponse createEvent(AdminEventSaveRequest request) {
        validateRequest(request, true);

        Event event = Event.create(
                request.getTitle(),
                request.getContent(),
                request.getLinkUrl(),
                request.isPeriodLimited(),
                request.getStartDate(),
                request.getEndDate(),
                defaultManualStatus(request.getManualProgressStatus())
        );

        event = eventRepository.save(event);

        StoredImageInfo storedImageInfo = storeImage(event.getId(), request.getImageFile());
        event.replaceImage(storedImageInfo.imageUrl(), storedImageInfo.absolutePath(), storedImageInfo.originalName());

        return AdminEventDetailResponse.from(event, LocalDate.now(), DATE_TIME_FORMATTER);
    }

    public AdminEventDetailResponse updateEvent(Long id, AdminEventSaveRequest request) {
        validateRequest(request, false);

        Event event = getEvent(id);

        String oldImagePath = event.getImagePath();

        event.updateBasicInfo(
                request.getTitle(),
                request.getContent(),
                request.getLinkUrl(),
                request.isPeriodLimited(),
                request.getStartDate(),
                request.getEndDate(),
                defaultManualStatus(request.getManualProgressStatus())
        );

        if (request.getImageFile() != null && !request.getImageFile().isEmpty()) {
            StoredImageInfo storedImageInfo = storeImage(event.getId(), request.getImageFile());
            event.replaceImage(storedImageInfo.imageUrl(), storedImageInfo.absolutePath(), storedImageInfo.originalName());
            deleteFileQuietly(oldImagePath);
        }

        return AdminEventDetailResponse.from(event, LocalDate.now(), DATE_TIME_FORMATTER);
    }

    public void deleteEvent(Long id) {
        Event event = getEvent(id);
        String imagePath = event.getImagePath();

        eventRepository.delete(event);
        deleteFileQuietly(imagePath);
    }

    @Transactional(readOnly = true)
    public FrontEventCursorResponse getFrontEvents(String statusValue, Long cursorId, int size) {
        EventFrontFilterStatus status = EventFrontFilterStatus.from(statusValue);
        LocalDate today = LocalDate.now();

        int safeSize = Math.max(1, Math.min(size, 30));
        PageRequest pageable = PageRequest.of(0, safeSize + 1);

        List<Event> rawEvents;
        long totalCount;

        switch (status) {
            case ONGOING -> {
                rawEvents = eventRepository.findFrontOngoingByCursor(cursorId, today, pageable);
                totalCount = eventRepository.countFrontOngoing(today);
            }
            case ENDED -> {
                rawEvents = eventRepository.findFrontEndedByCursor(cursorId, today, pageable);
                totalCount = eventRepository.countFrontEnded(today);
            }
            default -> {
                rawEvents = eventRepository.findFrontAllByCursor(cursorId, pageable);
                totalCount = eventRepository.countFrontAll();
            }
        }

        boolean hasNext = rawEvents.size() > safeSize;
        List<Event> pageEvents = hasNext ? rawEvents.subList(0, safeSize) : rawEvents;

        List<FrontEventListItemResponse> items = pageEvents.stream()
                .map(event -> FrontEventListItemResponse.from(event, today, DATE_TIME_FORMATTER))
                .toList();

        Long nextCursor = null;
        if (!pageEvents.isEmpty()) {
            nextCursor = pageEvents.get(pageEvents.size() - 1).getId();
        }

        return new FrontEventCursorResponse(items, totalCount, hasNext, nextCursor);
    }

    @Transactional(readOnly = true)
    public List<FrontEventIndexResponse> getFrontIndexEvents(int size) {
        LocalDate today = LocalDate.now();
        int safeSize = Math.max(1, Math.min(size, 10));

        List<Event> events = eventRepository.findOngoingForIndex(today, PageRequest.of(0, safeSize));

        return events.stream()
                .map(event -> FrontEventIndexResponse.from(event, today, DATE_TIME_FORMATTER))
                .toList();
    }

    private Event getEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("이벤트를 찾을 수 없습니다. id=" + id));
    }

    private void validateRequest(AdminEventSaveRequest request, boolean createMode) {
        if (request == null) {
            throw new IllegalArgumentException("요청값이 없습니다.");
        }

        if (!StringUtils.hasText(request.getTitle())) {
            throw new IllegalArgumentException("제목은 필수입니다.");
        }

        if (!StringUtils.hasText(request.getContent())) {
            throw new IllegalArgumentException("내용은 필수입니다.");
        }

        if (createMode && (request.getImageFile() == null || request.getImageFile().isEmpty())) {
            throw new IllegalArgumentException("이미지는 필수입니다.");
        }

        if (request.isPeriodLimited()) {
            if (request.getStartDate() == null || request.getEndDate() == null) {
                throw new IllegalArgumentException("기간한정 이벤트는 시작일과 종료일이 모두 필요합니다.");
            }

            if (request.getStartDate().isAfter(request.getEndDate())) {
                throw new IllegalArgumentException("시작일은 종료일보다 늦을 수 없습니다.");
            }
        }
    }

    private EventManualProgressStatus defaultManualStatus(EventManualProgressStatus status) {
        return status == null ? EventManualProgressStatus.ONGOING : status;
    }

    private StoredImageInfo storeImage(Long eventId, MultipartFile imageFile) {
        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 이미지가 없습니다.");
        }

        try {
            String originalName = imageFile.getOriginalFilename();
            String extension = getExtension(originalName);
            String storedName = UUID.randomUUID().toString().replace("-", "") + extension;
            String dateFolder = LocalDate.now().format(DATE_FOLDER_FORMATTER);

            Path directory = Paths.get(uploadPath, "event", String.valueOf(eventId), dateFolder);
            Files.createDirectories(directory);

            Path filePath = directory.resolve(storedName);
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/upload/event/" + eventId + "/" + dateFolder + "/" + storedName;

            return new StoredImageInfo(
                    imageUrl,
                    filePath.toAbsolutePath().toString(),
                    originalName == null ? storedName : originalName
            );
        } catch (IOException e) {
            throw new IllegalStateException("이벤트 이미지를 저장하지 못했습니다.", e);
        }
    }

    private void deleteFileQuietly(String absolutePath) {
        if (!StringUtils.hasText(absolutePath)) {
            return;
        }

        try {
            Files.deleteIfExists(Path.of(absolutePath));
        } catch (Exception ignored) {
        }
    }

    private String getExtension(String originalFilename) {
        if (!StringUtils.hasText(originalFilename)) {
            return "";
        }

        int idx = originalFilename.lastIndexOf(".");
        if (idx < 0) {
            return "";
        }

        return originalFilename.substring(idx);
    }

    private record StoredImageInfo(
            String imageUrl,
            String absolutePath,
            String originalName
    ) {
    }
}