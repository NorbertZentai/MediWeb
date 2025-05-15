package hu.project.MediTrack.modules.statistic.controller;

import hu.project.MediTrack.modules.statistic.entity.Statistic;
import hu.project.MediTrack.modules.statistic.service.StatisticService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/statistics")
public class StatisticController {

    @Autowired
    private StatisticService statisticService;

    /**
     * GET /api/statistics
     * Az összes statisztika lekérése.
     */
    @GetMapping
    public List<Statistic> getAllStatistics() {
        return statisticService.findAll();
    }

    /**
     * GET /api/statistics/{id}
     * Egy statisztika ID alapján.
     */
    @GetMapping("/{id}")
    public Statistic getStatisticById(@PathVariable Integer id) {
        Optional<Statistic> stat = statisticService.findById(id);
        return stat.orElse(null);
    }

    /**
     * POST /api/statistics
     * Új statisztika létrehozása.
     */
    @PostMapping
    public Statistic createStatistic(@RequestBody Statistic statistic) {
        return statisticService.save(statistic);
    }

    /**
     * PUT /api/statistics/{id}
     * Létező statisztika frissítése.
     */
    @PutMapping("/{id}")
    public Statistic updateStatistic(@PathVariable Integer id, @RequestBody Statistic updated) {
        return statisticService.findById(id).map(s -> {
            s.setUser(updated.getUser());
            s.setSearchCount(updated.getSearchCount());
            s.setMedicationsAddedCount(updated.getMedicationsAddedCount());
            s.setLastSearch(updated.getLastSearch());
            s.setLastMedicationAdded(updated.getLastMedicationAdded());
            return statisticService.save(s);
        }).orElse(null);
    }

    /**
     * DELETE /api/statistics/{id}
     * Statisztika törlése ID alapján.
     */
    @DeleteMapping("/{id}")
    public void deleteStatistic(@PathVariable Integer id) {
        statisticService.deleteById(id);
    }

    /**
     * GET /api/statistics/user/{userId}
     * Egy user statisztikájának lekérése.
     */
    @GetMapping("/user/{userId}")
    public Statistic getStatisticByUserId(@PathVariable Integer userId) {
        Optional<Statistic> stat = statisticService.findByUserId(userId);
        return stat.orElse(null);
    }

    /**
     * PUT /api/statistics/{id}/increment-search
     * Példa: keresésszámláló növelése.
     */
    @PutMapping("/{id}/increment-search")
    public Statistic incrementSearchCount(@PathVariable Integer id) {
        return statisticService.findById(id).map(s -> statisticService.incrementSearchCount(s))
                .orElse(null);
    }

    /**
     * PUT /api/statistics/{id}/increment-medication
     * Példa: medication számláló növelése.
     */
    @PutMapping("/{id}/increment-medication")
    public Statistic incrementMedicationsAddedCount(@PathVariable Integer id) {
        return statisticService.findById(id).map(s -> statisticService.incrementMedicationsAddedCount(s))
                .orElse(null);
    }
}
