package com.dev.SaeKimJP.repository.surgery;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.enums.surgery.SurgeryGroupType;
import com.dev.SaeKimJP.model.surgery.SurgeryPreviewImage;

public interface SurgeryPreviewImageRepository extends JpaRepository<SurgeryPreviewImage, Long> {
    List<SurgeryPreviewImage> findByGroupTypeOrderByDisplayOrderAscIdAsc(SurgeryGroupType groupType);
    List<SurgeryPreviewImage> findByGroupTypeAndActiveTrueOrderByDisplayOrderAscIdAsc(SurgeryGroupType groupType);
    long countByGroupType(SurgeryGroupType groupType);
}