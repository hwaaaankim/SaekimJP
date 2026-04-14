package com.dev.SaeKimJP.repository.main;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.main.MainBanner;

public interface MainBannerRepository extends JpaRepository<MainBanner, Long> {

    List<MainBanner> findAllByOrderByDisplayOrderAscIdAsc();
}