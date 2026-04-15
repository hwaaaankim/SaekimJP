package com.dev.SaeKimJP.repository.surgery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.surgery.SurgeryDetailIcon;

public interface SurgeryDetailIconRepository extends JpaRepository<SurgeryDetailIcon, Long> {
    List<SurgeryDetailIcon> findByDetailCategory_IdOrderByDisplayOrderAscIdAsc(Long detailCategoryId);
    void deleteByDetailCategory_Id(Long detailCategoryId);
}