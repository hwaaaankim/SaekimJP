package com.dev.SaeKimJP.repository.surgery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.surgery.SurgeryDetailStep;

public interface SurgeryDetailStepRepository extends JpaRepository<SurgeryDetailStep, Long> {
    List<SurgeryDetailStep> findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(Long detailCategoryId);
    void deleteByDetailCategory_Id(Long detailCategoryId);
}