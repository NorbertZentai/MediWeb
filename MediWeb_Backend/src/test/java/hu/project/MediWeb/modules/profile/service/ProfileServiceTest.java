package hu.project.MediWeb.modules.profile.service;

import hu.project.MediWeb.modules.profile.entity.Profile;
import hu.project.MediWeb.modules.profile.repository.ProfileRepository;
import hu.project.MediWeb.modules.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link ProfileService#requireOwnedProfile} tulajdonos-ellenőrzéséhez.
 * Idegen és nem létező profilra egyaránt 404-et várunk, hogy a válasz ne árulja el a profil létezését.
 */
@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private ProfileService profileService;

    private User owner;
    private User stranger;
    private Profile profile;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).email("owner@test.com").build();
        stranger = User.builder().id(2L).email("stranger@test.com").build();
        profile = Profile.builder().id(10L).user(owner).name("Anya").build();
    }

    @Test
    @DisplayName("requireOwnedProfile: a tulajdonos megkapja a profilt")
    void requireOwnedProfile_returnsProfile_forOwner() {
        when(profileRepository.findById(10L)).thenReturn(Optional.of(profile));

        assertThat(profileService.requireOwnedProfile(10L, owner)).isSameAs(profile);
    }

    @Test
    @DisplayName("requireOwnedProfile: más felhasználó profiljára 404")
    void requireOwnedProfile_throws404_forOtherUser() {
        when(profileRepository.findById(10L)).thenReturn(Optional.of(profile));

        assertThatThrownBy(() -> profileService.requireOwnedProfile(10L, stranger))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    @DisplayName("requireOwnedProfile: nem létező profilra 404")
    void requireOwnedProfile_throws404_whenMissing() {
        when(profileRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> profileService.requireOwnedProfile(99L, owner))
                .isInstanceOf(ResponseStatusException.class)
                .extracting(e -> ((ResponseStatusException) e).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }
}
