package com.dev.SaeKimJP.repository.event;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.dev.SaeKimJP.model.event.Event;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findAllByOrderByIdDesc();

    @Query("""
        select e
        from Event e
        where (:cursorId is null or e.id < :cursorId)
        order by e.id desc
    """)
    List<Event> findFrontAllByCursor(@Param("cursorId") Long cursorId, Pageable pageable);

    @Query("""
        select e
        from Event e
        where (:cursorId is null or e.id < :cursorId)
          and e.manualProgressStatus = com.dev.SaeKimJP.enums.event.EventManualProgressStatus.ONGOING
          and (e.periodLimited = false or e.endDate >= :today)
        order by e.id desc
    """)
    List<Event> findFrontOngoingByCursor(
            @Param("cursorId") Long cursorId,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    @Query("""
        select e
        from Event e
        where (:cursorId is null or e.id < :cursorId)
          and (
                e.manualProgressStatus = com.dev.SaeKimJP.enums.event.EventManualProgressStatus.ENDED
                or (e.periodLimited = true and e.endDate < :today)
          )
        order by e.id desc
    """)
    List<Event> findFrontEndedByCursor(
            @Param("cursorId") Long cursorId,
            @Param("today") LocalDate today,
            Pageable pageable
    );

    @Query("""
        select count(e)
        from Event e
    """)
    long countFrontAll();

    @Query("""
        select count(e)
        from Event e
        where e.manualProgressStatus = com.dev.SaeKimJP.enums.event.EventManualProgressStatus.ONGOING
          and (e.periodLimited = false or e.endDate >= :today)
    """)
    long countFrontOngoing(@Param("today") LocalDate today);

    @Query("""
        select count(e)
        from Event e
        where e.manualProgressStatus = com.dev.SaeKimJP.enums.event.EventManualProgressStatus.ENDED
           or (e.periodLimited = true and e.endDate < :today)
    """)
    long countFrontEnded(@Param("today") LocalDate today);

    @Query("""
        select e
        from Event e
        where e.manualProgressStatus = com.dev.SaeKimJP.enums.event.EventManualProgressStatus.ONGOING
          and (e.periodLimited = false or e.endDate >= :today)
        order by e.id desc
    """)
    List<Event> findOngoingForIndex(@Param("today") LocalDate today, Pageable pageable);
}