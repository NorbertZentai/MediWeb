package hu.project.MediWeb.modules.statistic.controller;

import hu.project.MediWeb.modules.statistic.dto.CategoryStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.ComplianceStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.MissedDoseStatisticsResponse;
import hu.project.MediWeb.modules.statistic.dto.PeakIntakeTimesResponse;
import hu.project.MediWeb.modules.statistic.dto.StatisticDTO;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
     * Az összes statisztika lekérése — csak ADMIN.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<StatisticDTO> getAllStatistics() {
        return statisticService.findAllDTO();
    }

    /**
     * GET /api/statistics/{id}
     * Egy statisztika ID alapján — csak a tulajdonosa vagy ADMIN.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StatisticDTO> getStatisticById(@PathVariable Integer id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statisticService.getAccessibleDTO(id, currentUser));
    }

    /**
     * POST /api/statistics
     * Új statisztika létrehozása; a tulajdonost a szerver a bejelentkezett
     * felhasználóból állítja be, a törzsben küldött idegen user nem érvényesül.
     */
    @PostMapping
    public ResponseEntity<StatisticDTO> createStatistic(@RequestBody Statistic statistic) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statisticService.createForUser(currentUser, statistic));
    }

    /**
     * PUT /api/statistics/{id}
     * Létező statisztika frissítése — csak a tulajdonosa vagy ADMIN.
     */
    @PutMapping("/{id}")
    public ResponseEntity<StatisticDTO> updateStatistic(@PathVariable Integer id, @RequestBody Statistic updated) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statisticService.updateAccessible(id, currentUser, updated));
    }

    /**
     * DELETE /api/statistics/{id}
     * Statisztika törlése ID alapján — csak a tulajdonosa vagy ADMIN.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatistic(@PathVariable Integer id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        statisticService.deleteAccessible(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/statistics/user/{userId}
     * Egy user statisztikájának lekérése — csak a saját userId vagy ADMIN.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<StatisticDTO> getStatisticByUserId(@PathVariable Integer userId) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        StatisticDTO dto = statisticService.getByUserIdAccessible(userId, currentUser);
        return dto != null ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    /**
     * PUT /api/statistics/{id}/increment-search
     * Keresésszámláló növelése — csak a tulajdonosa vagy ADMIN.
     */
    @PutMapping("/{id}/increment-search")
    public ResponseEntity<StatisticDTO> incrementSearchCount(@PathVariable Integer id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statisticService.incrementSearchAccessible(id, currentUser));
    }

    /**
     * PUT /api/statistics/{id}/increment-medication
     * Medication számláló növelése — csak a tulajdonosa vagy ADMIN.
     */
    @PutMapping("/{id}/increment-medication")
    public ResponseEntity<StatisticDTO> incrementMedicationsAddedCount(@PathVariable Integer id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(statisticService.incrementMedicationAccessible(id, currentUser));
    }
}
