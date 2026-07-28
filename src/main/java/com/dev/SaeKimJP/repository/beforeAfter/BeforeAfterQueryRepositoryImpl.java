package com.dev.SaeKimJP.repository.beforeAfter;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.dev.SaeKimJP.enums.beforeAfter.BeforeAfterCategory;
import com.dev.SaeKimJP.model.beforeAfter.BeforeAfter;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;

@Repository
public class BeforeAfterQueryRepositoryImpl implements BeforeAfterQueryRepository {

    @PersistenceContext
    private EntityManager em;

    @Override
    public List<BeforeAfter> findList(BeforeAfterCategory category, int offset, int limit) {
        StringBuilder jpql = new StringBuilder();
        jpql.append("select b from BeforeAfter b ");

        if (category != null) {
            jpql.append("where b.category = :category ");
        }

        /*
         * 프론트는 전체 폭을 6칸으로 나누고 촬영 시점 수만큼 카드를 배치합니다.
         * 페이지네이션이 적용된 상태에서도 3시점 → 2시점 → 1시점 우선순위가 유지되도록
         * 조회 단계부터 완성된 촬영 시점 수 내림차순으로 정렬합니다.
         */
        jpql.append("order by (");
        jpql.append("case when b.beforeFrontImageUrl is not null and b.beforeFrontImageUrl <> '' ");
        jpql.append("and b.afterFrontImageUrl is not null and b.afterFrontImageUrl <> '' then 1 else 0 end + ");
        jpql.append("case when b.beforeAngle45ImageUrl is not null and b.beforeAngle45ImageUrl <> '' ");
        jpql.append("and b.afterAngle45ImageUrl is not null and b.afterAngle45ImageUrl <> '' then 1 else 0 end + ");
        jpql.append("case when b.beforeAngle90ImageUrl is not null and b.beforeAngle90ImageUrl <> '' ");
        jpql.append("and b.afterAngle90ImageUrl is not null and b.afterAngle90ImageUrl <> '' then 1 else 0 end");
        jpql.append(") desc, b.createdAt desc, b.id desc");

        TypedQuery<BeforeAfter> query = em.createQuery(jpql.toString(), BeforeAfter.class);

        if (category != null) {
            query.setParameter("category", category);
        }

        return query
                .setFirstResult(Math.max(offset, 0))
                .setMaxResults(Math.max(limit, 1))
                .getResultList();
    }

    @Override
    public long countList(BeforeAfterCategory category) {
        StringBuilder jpql = new StringBuilder();
        jpql.append("select count(b) from BeforeAfter b ");

        if (category != null) {
            jpql.append("where b.category = :category");
        }

        TypedQuery<Long> query = em.createQuery(jpql.toString(), Long.class);

        if (category != null) {
            query.setParameter("category", category);
        }

        return query.getSingleResult();
    }
}
