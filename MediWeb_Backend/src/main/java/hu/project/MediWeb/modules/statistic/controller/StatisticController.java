package hu.project.MediWeb.modules.statistic.controller;

import hu.project.MediWeb.modules.statistic.dto.CategoryStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.ComplianceStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.MissedDoseStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.PeakIntakeTimesResponse;
import hu.project.MediWeb.modules.statistic.dto.TrendStatisticsResponse;
import hu.project.MediWeb.modules.statistic.entity.Statistic;
import hu.project.MediWeb.modules.statistic.service.StatisticService;
import hu.project.MediWeb.modules.statistic.service.StatisticsAggregationService;
import hu.project.MediWeb.modules.statistic.service.StatisticsPeriod;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticController {

    private final StatisticService statisticService;
    private final StatisticsAggregationService statisticsAggregationService;
    private final UserService userService;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() ||
                "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        return userService.findUserByEmail(authentication.getName()).orElse(null);
    }

    @GetMapping("/compliance")
    public ResponseEntity<ComplianceStatisticsResponse> getComplianceStatistics(@RequestParam(value = "period", required = false) String periodParam) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        StatisticsPeriod period = StatisticsPeriod.fromParam(periodParam);
        ComplianceStatisticsResponse response = statisticsAggregationService.getComplianceStatistics(user, period);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trends")
    public ResponseEntity<TrendStatisticsResponse> getTrendStatistics(@RequestParam(value = "period", required = false) String periodParam) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        StatisticsPeriod period = StatisticsPeriod.fromParam(periodParam);
        TrendStatisticsResponse response = statisticsAggregationService.getTrendStatistics(user, period);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/categories")
    public ResponseEntity<CategoryStatisticsResponse> getCategoryStatistics(@RequestParam(value = "period", required = false) String periodParam) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        StatisticsPeriod period = StatisticsPeriod.fromParam(periodParam);
        CategoryStatisticsResponse response = statisticsAggregationService.getCategoryStatistics(user, period);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/missed-doses")
    public ResponseEntity<MissedDoseStatisticsResponse> getMissedDoseStatistics(@RequestParam(value = "period", required = false) String periodParam) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        StatisticsPeriod period = StatisticsPeriod.fromParam(periodParam);
        MissedDoseStatisticsResponse response = statisticsAggregationService.getMissedDoseStatistics(user, period);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/peak-times")
    public ResponseEntity<PeakIntakeTimesResponse> getPeakIntakeTimes(@RequestParam(value = "period", required = false) String periodParam) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        StatisticsPeriod period = StatisticsPeriod.fromParam(periodParam);
        PeakIntakeTimesResponse response = statisticsAggregationService.getPeakIntakeTimes(user, period);
        return ResponseEntity.ok(response);
    }

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
