package hu.project.MediWeb.modules.user.service;

import hu.project.MediWeb.modules.user.dto.PasswordChangeRequest;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tesztek a {@link UserService} üzleti logikájához.
 * A repository, a JdbcTemplate és a PasswordEncoder mockolva van — adatbázis nem kell,
 * csak a service-réteg viselkedését ellenőrizzük (happy path + hibaágak).
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .name("Teszt Elek")
                .email("teszt@example.com")
                .password("encodedRegiJelszo")
                .role(UserRole.USER)
                .build();
    }

    // ---------- saveUser ----------

    @Test
    @DisplayName("saveUser: ha nincs regisztrációs dátum, beállítja a mentés előtt")
    void saveUser_setsRegistrationDate_whenNull() {
        user.setRegistration_date(null);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.saveUser(user);

        assertThat(saved.getRegistration_date()).isNotNull();
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("saveUser: meglévő regisztrációs dátumot nem ír felül")
    void saveUser_keepsRegistrationDate_whenAlreadySet() {
        LocalDateTime original = LocalDateTime.of(2020, 1, 1, 10, 0);
        user.setRegistration_date(original);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User saved = userService.saveUser(user);

        assertThat(saved.getRegistration_date()).isEqualTo(original);
    }

    // ---------- changePassword ----------

    @Test
    @DisplayName("changePassword: helyes jelenlegi jelszó + egyező új jelszók → true, és menti a kódolt jelszót")
    void changePassword_returnsTrue_whenCurrentValidAndNewMatches() {
        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setCurrentPassword("regiJelszo");
        request.setNewPassword("ujJelszo123");
        request.setReNewPassword("ujJelszo123");

        when(passwordEncoder.matches("regiJelszo", "encodedRegiJelszo")).thenReturn(true);
        when(passwordEncoder.encode("ujJelszo123")).thenReturn("encodedUjJelszo");

        boolean result = userService.changePassword(user, request);

        assertThat(result).isTrue();
        assertThat(user.getPassword()).isEqualTo("encodedUjJelszo");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("changePassword: rossz jelenlegi jelszó → false, nem ment")
    void changePassword_returnsFalse_whenCurrentPasswordWrong() {
        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setCurrentPassword("rosszJelszo");
        request.setNewPassword("ujJelszo123");
        request.setReNewPassword("ujJelszo123");

        when(passwordEncoder.matches("rosszJelszo", "encodedRegiJelszo")).thenReturn(false);

        boolean result = userService.changePassword(user, request);

        assertThat(result).isFalse();
        assertThat(user.getPassword()).isEqualTo("encodedRegiJelszo");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("changePassword: nem egyező új jelszók → false, nem ment")
    void changePassword_returnsFalse_whenNewPasswordsDontMatch() {
        PasswordChangeRequest request = new PasswordChangeRequest();
        request.setCurrentPassword("regiJelszo");
        request.setNewPassword("ujJelszo123");
        request.setReNewPassword("masikJelszo456");

        when(passwordEncoder.matches("regiJelszo", "encodedRegiJelszo")).thenReturn(true);

        boolean result = userService.changePassword(user, request);

        assertThat(result).isFalse();
        verify(userRepository, never()).save(any());
    }

    // ---------- verifyPassword ----------

    @Test
    @DisplayName("verifyPassword: null user → false")
    void verifyPassword_returnsFalse_whenUserNull() {
        boolean result = userService.verifyPassword(null, "barmi");

        assertThat(result).isFalse();
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("verifyPassword: null jelszó → false")
    void verifyPassword_returnsFalse_whenRawPasswordNull() {
        boolean result = userService.verifyPassword(user, null);

        assertThat(result).isFalse();
        verifyNoInteractions(passwordEncoder);
    }

    @Test
    @DisplayName("verifyPassword: egyező jelszó → true")
    void verifyPassword_returnsTrue_whenMatches() {
        when(passwordEncoder.matches("helyesJelszo", "encodedRegiJelszo")).thenReturn(true);

        boolean result = userService.verifyPassword(user, "helyesJelszo");

        assertThat(result).isTrue();
    }

    @Test
    @DisplayName("verifyPassword: nem egyező jelszó → false")
    void verifyPassword_returnsFalse_whenNotMatches() {
        when(passwordEncoder.matches("rosszJelszo", "encodedRegiJelszo")).thenReturn(false);

        boolean result = userService.verifyPassword(user, "rosszJelszo");

        assertThat(result).isFalse();
    }

    // ---------- updateUserRole ----------

    @Test
    @DisplayName("updateUserRole: létező felhasználónál frissíti és menti az új szerepkört")
    void updateUserRole_updatesAndSaves_whenUserExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User result = userService.updateUserRole(1L, UserRole.ADMIN);

        assertThat(result).isNotNull();
        assertThat(result.getRole()).isEqualTo(UserRole.ADMIN);
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("updateUserRole: nem létező felhasználó → null, nem ment")
    void updateUserRole_returnsNull_whenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        User result = userService.updateUserRole(99L, UserRole.ADMIN);

        assertThat(result).isNull();
        verify(userRepository, never()).save(any());
    }

    // ---------- deleteUser ----------

    @Test
    @DisplayName("deleteUser: törli a kapcsolódó sorokat (favorites, reviews, profiles), majd a felhasználót")
    void deleteUser_removesRelatedRowsThenDeletesUser() {
        userService.deleteUser(1L);

        verify(jdbcTemplate).update(eq("DELETE FROM favorites WHERE user_id = ?"), eq(1L));
        verify(jdbcTemplate).update(eq("DELETE FROM reviews WHERE user_id = ?"), eq(1L));
        verify(jdbcTemplate).update(eq("DELETE FROM profiles WHERE user_id = ?"), eq(1L));
        verify(jdbcTemplate, times(3)).update(anyString(), eq(1L));
        verify(userRepository).deleteById(1L);
    }
}
