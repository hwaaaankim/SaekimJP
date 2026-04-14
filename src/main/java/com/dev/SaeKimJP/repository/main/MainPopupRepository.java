package com.dev.SaeKimJP.repository.main;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.main.MainPopup;

public interface MainPopupRepository extends JpaRepository<MainPopup, Long> {

    List<MainPopup> findAllByOrderByDisplayOrderAscIdAsc();
}