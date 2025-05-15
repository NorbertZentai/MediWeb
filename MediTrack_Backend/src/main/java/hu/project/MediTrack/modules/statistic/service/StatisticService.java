package hu.project.MediTrack.modules.statistic.service;

import hu.project.MediTrack.modules.statistic.entity.Statistic;
import hu.project.MediTrack.modules.statistic.repository.StatisticRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StatisticService {

    @Autowired
    private StatisticRepository statisticRepository;

    public List<Statistic> findAll() {
        return statisticRepository.findAll();
    }

    public Optional<Statistic> findById(Integer id) {
        return statisticRepository.findById(id);
    }

    public Statistic save(Statistic statistic) {
        return statisticRepository.save(statistic);
    }

    public void deleteById(Integer id) {
        statisticRepository.deleteById(id);
    }

    /**
     * Ha userenként 1 statisztika van, ezzel lekérhető:
     */
    public Optional<Statistic> findByUserId(Integer userId) {
        return statisticRepository.findByUserId(userId);
    }

    /**
     * Példa: Keresés szám növelése egy usernél.
     */
    public Statistic incrementSearchCount(Statistic statistic) {
        statistic.setSearchCount(statistic.getSearchCount() + 1);
        statistic.setLastSearch(LocalDateTime.now());
        return statisticRepository.save(statistic);
    }

    /**
     * Példa: Gyógyszer hozzáadások számának növelése.
     */
    public Statistic incrementMedicationsAddedCount(Statistic statistic) {
        statistic.setMedicationsAddedCount(statistic.getMedicationsAddedCount() + 1);
        statistic.setLastMedicationAdded(LocalDateTime.now());
        return statisticRepository.save(statistic);
    }
}
