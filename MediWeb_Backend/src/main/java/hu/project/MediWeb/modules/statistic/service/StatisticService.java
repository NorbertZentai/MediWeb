package hu.project.MediWeb.modules.statistic.service;

import hu.project.MediWeb.modules.statistic.dto.StatisticDTO;
import hu.project.MediWeb.modules.statistic.entity.Statistic;
import hu.project.MediWeb.modules.statistic.repository.StatisticRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // --- Owner-or-admin access-controlled DTO API (Issue #46) ---

    public List<StatisticDTO> findAllDTO() {
        return statisticRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Egy statisztikát csak a tulajdonosa vagy ADMIN érhet el. Nem létező id-ra 404,
     * idegen tulajdonosú rekordra 403.
     */
    public StatisticDTO getAccessibleDTO(Integer id, User currentUser) {
        Statistic statistic = findOrThrow(id);
        assertOwnerOrAdmin(statistic.getUser().getId(), currentUser);
        return convertToDTO(statistic);
    }

    /**
     * Új statisztika létrehozása: a tulajdonost mindig a bejelentkezett felhasználóból
     * állítjuk be, a kérés törzsében esetlegesen küldött idegen user mező nem érvényesül.
     * Mivel felhasználónként dokumentáltan legfeljebb 1 statisztika sor tartozik
     * ({@link StatisticRepository#findByUserId}), ha a hívónak már van rekordja,
     * azt frissítjük ahelyett, hogy duplikált sort hoznánk létre ugyanahhoz a userhez.
     */
    public StatisticDTO createForUser(User currentUser, Statistic incoming) {
        Optional<Statistic> existing = currentUser.getId() != null
                ? statisticRepository.findByUserId(currentUser.getId().intValue())
                : Optional.empty();

        Statistic toSave = existing.orElseGet(Statistic::new);
        toSave.setUser(currentUser);
        toSave.setSearchCount(incoming.getSearchCount());
        toSave.setMedicationsAddedCount(incoming.getMedicationsAddedCount());
        toSave.setLastSearch(incoming.getLastSearch());
        toSave.setLastMedicationAdded(incoming.getLastMedicationAdded());

        Statistic saved = statisticRepository.save(toSave);
        return convertToDTO(saved);
    }

    public StatisticDTO updateAccessible(Integer id, User currentUser, Statistic updated) {
        Statistic existing = findOrThrow(id);
        assertOwnerOrAdmin(existing.getUser().getId(), currentUser);

        existing.setSearchCount(updated.getSearchCount());
        existing.setMedicationsAddedCount(updated.getMedicationsAddedCount());
        existing.setLastSearch(updated.getLastSearch());
        existing.setLastMedicationAdded(updated.getLastMedicationAdded());

        Statistic saved = statisticRepository.save(existing);
        return convertToDTO(saved);
    }

    public void deleteAccessible(Integer id, User currentUser) {
        Statistic existing = findOrThrow(id);
        assertOwnerOrAdmin(existing.getUser().getId(), currentUser);
        statisticRepository.delete(existing);
    }

    public StatisticDTO incrementSearchAccessible(Integer id, User currentUser) {
        Statistic existing = findOrThrow(id);
        assertOwnerOrAdmin(existing.getUser().getId(), currentUser);
        return convertToDTO(incrementSearchCount(existing));
    }

    public StatisticDTO incrementMedicationAccessible(Integer id, User currentUser) {
        Statistic existing = findOrThrow(id);
        assertOwnerOrAdmin(existing.getUser().getId(), currentUser);
        return convertToDTO(incrementMedicationsAddedCount(existing));
    }

    /**
     * Csak a saját userId vagy ADMIN engedélyezett; idegen userId-ra 403.
     */
    public StatisticDTO getByUserIdAccessible(Integer userId, User currentUser) {
        assertOwnerOrAdmin(userId.longValue(), currentUser);
        return statisticRepository.findByUserId(userId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    private Statistic findOrThrow(Integer id) {
        return statisticRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Statisztika nem található: " + id));
    }

    private void assertOwnerOrAdmin(Long ownerId, User currentUser) {
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }
        if (ownerId == null || !ownerId.equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nincs jogosultság ehhez a statisztikához");
        }
    }

    private StatisticDTO convertToDTO(Statistic statistic) {
        return StatisticDTO.builder()
                .id(statistic.getId())
                .userId(statistic.getUser() != null ? statistic.getUser().getId() : null)
                .searchCount(statistic.getSearchCount())
                .medicationsAddedCount(statistic.getMedicationsAddedCount())
                .lastSearch(statistic.getLastSearch())
                .lastMedicationAdded(statistic.getLastMedicationAdded())
                .build();
    }
}
