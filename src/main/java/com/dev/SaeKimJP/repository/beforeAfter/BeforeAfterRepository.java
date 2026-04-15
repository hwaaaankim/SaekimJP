package com.dev.SaeKimJP.repository.beforeAfter;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.beforeAfter.BeforeAfter;

public interface BeforeAfterRepository extends JpaRepository<BeforeAfter, Long>, BeforeAfterQueryRepository {
}