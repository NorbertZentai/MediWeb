package hu.project.MediWeb.modules.favorite.service;

import hu.project.MediWeb.modules.favorite.entity.Favorite;
import hu.project.MediWeb.modules.favorite.repository.FavoriteRepository;
import hu.project.MediWeb.modules.medication.entity.Medication;
import hu.project.MediWeb.modules.medication.repository.MedicationRepository;
import hu.project.MediWeb.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link FavoriteService} üzleti logikájához.
 * A FavoriteRepository és a MedicationRepository mockolva van — adatbázis nélkül
 * ellenőrizzük a kedvenc hozzáadásának ágait (nem létező gyógyszer, már kedvenc, új)
 * és a törlés validációját.
 */
@ExtendWith(MockitoExtension.class)
class FavoriteServiceTest {

    @Mock
    private FavoriteRepository favoriteRepository;
    @Mock
    private MedicationRepository medicationRepository;

    @InjectMocks
    private FavoriteService favoriteService;

    private User user;
    private Medication medication;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email("teszt@example.com").build();
        medication = Medication.builder().id(10L).name("Aspirin").build();
    }

    // ---------- findByUserId ----------

    @Test
    @DisplayName("findByUserId: továbbadja a repository találatait")
    void findByUserId_delegatesToRepository() {
        Favorite favorite = Favorite.builder().id(5L).user(user).medication(medication).build();
        when(favoriteRepository.findByUserId(1L)).thenReturn(List.of(favorite));

        List<Favorite> result = favoriteService.findByUserId(1L);

        assertThat(result).containsExactly(favorite);
    }

    // ---------- addFavorite ----------

    @Test
    @DisplayName("addFavorite: nem létező gyógyszer → IllegalArgumentException, nem ment")
    void addFavorite_throws_whenMedicationNotFound() {
        when(medicationRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> favoriteService.addFavorite(user, 10L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Gyógyszer nem található");

        verify(favoriteRepository, never()).save(any());
    }

    @Test
    @DisplayName("addFavorite: ha már kedvenc, a meglévőt adja vissza, és nem ment újat")
    void addFavorite_returnsExisting_whenAlreadyFavorited() {
        Favorite existing = Favorite.builder().id(5L).user(user).medication(medication).build();
        when(medicationRepository.findById(10L)).thenReturn(Optional.of(medication));
        when(favoriteRepository.findByUserAndMedication(user, medication)).thenReturn(Optional.of(existing));

        Favorite result = favoriteService.addFavorite(user, 10L);

        assertThat(result).isSameAs(existing);
        verify(favoriteRepository, never()).save(any());
    }

    @Test
    @DisplayName("addFavorite: új kedvenc esetén létrehozza és menti a megfelelő user-rel és gyógyszerrel")
    void addFavorite_createsAndSaves_whenNew() {
        when(medicationRepository.findById(10L)).thenReturn(Optional.of(medication));
        when(favoriteRepository.findByUserAndMedication(user, medication)).thenReturn(Optional.empty());
        when(favoriteRepository.save(any(Favorite.class))).thenAnswer(inv -> inv.getArgument(0));

        Favorite result = favoriteService.addFavorite(user, 10L);

        ArgumentCaptor<Favorite> captor = ArgumentCaptor.forClass(Favorite.class);
        verify(favoriteRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isSameAs(user);
        assertThat(captor.getValue().getMedication()).isSameAs(medication);
        assertThat(result.getUser()).isSameAs(user);
        assertThat(result.getMedication()).isSameAs(medication);
    }

    // ---------- deleteById ----------

    @Test
    @DisplayName("deleteById: nem létező ID → IllegalArgumentException, nem töröl")
    void deleteById_throws_whenNotExists() {
        when(favoriteRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> favoriteService.deleteById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Nem létezik ilyen favorite ID");

        verify(favoriteRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("deleteById: létező ID esetén törli a kedvencet")
    void deleteById_deletes_whenExists() {
        when(favoriteRepository.existsById(5L)).thenReturn(true);

        favoriteService.deleteById(5L);

        verify(favoriteRepository).deleteById(5L);
    }
}
