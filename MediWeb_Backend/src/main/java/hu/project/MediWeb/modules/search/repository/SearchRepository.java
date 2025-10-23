package hu.project.MediWeb.modules.search.repository;

import hu.project.MediWeb.modules.search.entity.Search;
import hu.project.MediWeb.modules.search.repository.projection.SearchKeywordProjection;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * A Search entitáshoz tartozó repository,
 * amely az alap CRUD műveleteket nyújtja.
 */
public interface SearchRepository extends JpaRepository<Search, Integer> {

    /**
     * Példa: egy felhasználó összes keresésének lekérdezése.
     */
    List<Search> findByUserId(Integer userId);

    /**
     * Példa: keresés kulcsszó részlet alapján.
     */
    List<Search> findByKeywordContainingIgnoreCase(String keywordPart);

    @Query("SELECT s.keyword AS keyword, COUNT(s.id) AS searchCount " +
           "FROM Search s " +
           "GROUP BY s.keyword " +
           "ORDER BY COUNT(s.id) DESC")
    List<SearchKeywordProjection> findTopKeywords(Pageable pageable);
}
