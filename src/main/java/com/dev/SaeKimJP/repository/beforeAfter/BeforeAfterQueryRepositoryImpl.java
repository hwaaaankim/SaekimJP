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

        jpql.append("order by b.createdAt desc, b.id desc");

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