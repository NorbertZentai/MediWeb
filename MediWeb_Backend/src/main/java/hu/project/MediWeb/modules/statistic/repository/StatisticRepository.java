package hu.project.MediWeb.modules.statistic.repository;

import hu.project.MediWeb.modules.statistic.entity.Statistic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StatisticRepository extends JpaRepository<Statistic, Integer> {

    /**
     * Egy user statisztikájának lekérése. A user_id oszlopon nincs adatbázis-szintű
     * UNIQUE megszorítás, ezért natív LIMIT 1-gyel defenzíven kezeljük azt az esetet is,
     * ha (pl. teszt- vagy migrációs adatból eredően) egy felhasználóhoz több sor is
     * tartozna — így ez sosem dob NonUniqueResultException-t, csak a legutóbbit adja vissza.
     */
    @Query(value = "SELECT * FROM statistics WHERE user_id = :userId ORDER BY id DESC LIMIT 1", nativeQuery = true)
    Optional<Statistic> findByUserId(@Param("userId") Integer userId);
}
