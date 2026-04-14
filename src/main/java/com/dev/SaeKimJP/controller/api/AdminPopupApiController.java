package com.dev.SaeKimJP.controller.api;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dev.SaeKimJP.dto.main.DisplayOrderUpdateRequest;
import com.dev.SaeKimJP.dto.main.MainPopupAdminResponse;
import com.dev.SaeKimJP.dto.main.MainPopupUpsertRequest;
import com.dev.SaeKimJP.service.main.MainPopupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/popups")
public class AdminPopupApiController {

    private final MainPopupService mainPopupService;

    @GetMapping
    public List<MainPopupAdminResponse> list() {
        return mainPopupService.getAdminList();
    }

    @PostMapping
    public MainPopupAdminResponse create(@ModelAttribute MainPopupUpsertRequest request) {
        return mainPopupService.create(request);
    }

    @PostMapping("/{id}")
    public MainPopupAdminResponse update(@PathVariable Long id,
                                         @ModelAttribute MainPopupUpsertRequest request) {
        return mainPopupService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mainPopupService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/display-order")
    public ResponseEntity<Void> updateDisplayOrder(@RequestBody List<DisplayOrderUpdateRequest> requestList) {
        mainPopupService.updateDisplayOrders(requestList);
        return ResponseEntity.ok().build();
    }
}