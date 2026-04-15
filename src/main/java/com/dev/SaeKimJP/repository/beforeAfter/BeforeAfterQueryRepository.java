package com.dev.SaeKimJP.repository.beforeAfter;

import java.util.List;

import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterCategory;
import com.dev.SaeKimJP.model.beforeAfter.BeforeAfter;

public interface BeforeAfterQueryRepository {

    List<BeforeAfter> findList(BeforeAfterCategory category, int offset, int limit);

    long countList(BeforeAfterCategory category);
}