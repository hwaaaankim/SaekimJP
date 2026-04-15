package com.dev.SaeKimJP.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.event.FrontEventCursorResponse;
import com.dev.SaeKimJP.dto.event.FrontEventIndexResponse;
import com.dev.SaeKimJP.service.event.EventService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class FrontEventApiController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<FrontEventCursorResponse> getEvents(
            @RequestParam(name = "status", defaultValue = "all") String status,
            @RequestParam(name = "cursorId", required = false) Long cursorId,
            @RequestParam(name = "size", defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(eventService.getFrontEvents(status, cursorId, size));
    }

    @GetMapping("/index")
    public ResponseEntity<List<FrontEventIndexResponse>> getIndexEvents(
            @RequestParam(name = "size", defaultValue = "5") int size
    ) {
        return ResponseEntity.ok(eventService.getFrontIndexEvents(size));
    }
}