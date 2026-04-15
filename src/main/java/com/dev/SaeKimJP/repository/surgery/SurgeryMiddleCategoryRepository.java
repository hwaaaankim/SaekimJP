package com.dev.SaeKimJP.repository.surgery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.model.surgery.SurgeryMiddleCategory;

public interface SurgeryMiddleCategoryRepository extends JpaRepository<SurgeryMiddleCategory, Long> {
    List<SurgeryMiddleCategory> findByGroupTypeOrderByDisplayOrderAscIdAsc(SurgeryGroupType groupType);
    List<SurgeryMiddleCategory> findByGroupTypeAndActiveTrueOrderByDisplayOrderAscIdAsc(SurgeryGroupType groupType);
    long countByGroupType(SurgeryGroupType groupType);
}