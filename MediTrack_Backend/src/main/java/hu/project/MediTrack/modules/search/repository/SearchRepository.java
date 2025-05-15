package hu.project.MediTrack.modules.search.repository;

import hu.project.MediTrack.modules.search.entity.Search;
import org.springframework.data.jpa.repository.JpaRepository;

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
}
