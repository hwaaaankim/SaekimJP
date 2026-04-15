package com.dev.SaeKimJP.repository.community;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dev.SaeKimJP.model.community.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

    @Query("select coalesce(max(n.displayIndex), 0) from Notice n")
    Integer findMaxDisplayIndex();

    @Query("select n from Notice n order by n.displayIndex asc, n.id desc")
    List<Notice> findAllForAdmin();

    @Query("""
        select n
        from Notice n
        where (:keyword is null or :keyword = '' or lower(n.title) like lower(concat('%', :keyword, '%')))
        order by n.displayIndex asc, n.id desc
    """)
    Page<Notice> searchByTitle(@Param("keyword") String keyword, Pageable pageable);

    List<Notice> findAllByOrderByDisplayIndexAscIdDesc();
}