package hu.project.MediWeb.modules.statistic.repository;

import hu.project.MediWeb.modules.statistic.entity.Statistic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatisticRepository extends JpaRepository<Statistic, Integer> {

    /**
     * Például: egy user statisztikájának lekérése (ha felhasználóként
     * csak 1 statisztika van).
     */
    Optional<Statistic> findByUserId(Integer userId);
}
