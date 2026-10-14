package com.dev.SaeKimJP.repository.community;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.dev.SaeKimJP.model.community.Faq;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    @Override
    @EntityGraph(attributePaths = "topic")
    Page<Faq> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Page<Faq> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Page<Faq> findByTopic_Id(Long topicId, Pageable pageable);

    @EntityGraph(attributePaths = "topic")
    Page<Faq> findByTopic_IdAndTitleContainingIgnoreCase(Long topicId, String title, Pageable pageable);

    boolean existsByTopic_Id(Long topicId);

    long countByTopic_Id(Long topicId);

    @Query("select f.topic.id, count(f.id) from Faq f group by f.topic.id")
    List<Object[]> countGroupedByTopic();
}
