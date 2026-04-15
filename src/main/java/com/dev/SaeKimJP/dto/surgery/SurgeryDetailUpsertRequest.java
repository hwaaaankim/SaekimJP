package com.dev.SaeKimJP.dto.surgery;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SurgeryDetailUpsertRequest {

    @NotNull
    private Long middleCategoryId;

    @NotBlank
    private String name;

    @NotBlank
    private String introText;

    private Boolean active;

    private List<SurgeryDetailItemRequest> steps = new ArrayList<>();
    private List<SurgeryDetailItemRequest> icons = new ArrayList<>();
}