package com.dev.SaeKimJP.repository.community;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dev.SaeKimJP.model.community.FaqTopic;

public interface FaqTopicRepository extends JpaRepository<FaqTopic, Long> {

    List<FaqTopic> findAllByOrderByDisplayOrderAscIdAsc();

    Optional<FaqTopic> findByNameIgnoreCase(String name);

    Optional<FaqTopic> findTopByOrderByDisplayOrderDescIdDesc();
}
