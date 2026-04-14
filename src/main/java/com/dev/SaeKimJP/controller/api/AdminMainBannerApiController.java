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
import com.dev.SaeKimJP.dto.main.MainBannerAdminResponse;
import com.dev.SaeKimJP.dto.main.MainBannerUpsertRequest;
import com.dev.SaeKimJP.service.main.MainBannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api/main-banners")
public class AdminMainBannerApiController {

    private final MainBannerService mainBannerService;

    @GetMapping
    public List<MainBannerAdminResponse> list() {
        return mainBannerService.getAdminList();
    }

    @PostMapping
    public MainBannerAdminResponse create(@ModelAttribute MainBannerUpsertRequest request) {
        return mainBannerService.create(request);
    }

    @PostMapping("/{id}")
    public MainBannerAdminResponse update(@PathVariable Long id,
                                          @ModelAttribute MainBannerUpsertRequest request) {
        return mainBannerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mainBannerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/display-order")
    public ResponseEntity<Void> updateDisplayOrder(@RequestBody List<DisplayOrderUpdateRequest> requestList) {
        mainBannerService.updateDisplayOrders(requestList);
        return ResponseEntity.ok().build();
    }
}