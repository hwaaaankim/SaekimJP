package com.dev.SaeKimJP.dto.surgery;

import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SurgeryIdOrderRequest {

    @NotEmpty
    private List<Long> ids;
}