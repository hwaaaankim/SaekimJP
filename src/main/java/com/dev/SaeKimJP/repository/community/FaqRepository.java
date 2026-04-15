package com.dev.SaeKimJP.repository.community;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.community.Faq;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    Page<Faq> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}