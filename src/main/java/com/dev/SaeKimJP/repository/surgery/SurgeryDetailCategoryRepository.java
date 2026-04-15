package com.dev.SaeKimJP.repository.surgery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.surgery.SurgeryDetailCategory;

public interface SurgeryDetailCategoryRepository extends JpaRepository<SurgeryDetailCategory, Long> {
    List<SurgeryDetailCategory> findByMiddleCategory_IdOrderByDisplayOrderAscIdAsc(Long middleCategoryId);
    List<SurgeryDetailCategory> findByMiddleCategory_IdAndActiveTrueOrderByDisplayOrderAscIdAsc(Long middleCategoryId);
    long countByMiddleCategory_Id(Long middleCategoryId);
    boolean existsByMiddleCategory_Id(Long middleCategoryId);
}