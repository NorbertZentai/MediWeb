package hu.project.MediWeb.support;

import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Újrahasználható teszt-segéd JWT-vel hitelesített felhasználók előállításához.
 * <p>
 * Kiváltja az integrációs tesztekben korábban duplikált
 * {@code passwordEncoder.encode(...)} + {@code jwtUtil.generateJwtToken(...)} logikát.
 * A {@link #createUser(String, UserRole)} idempotens: előbb törli a megadott email
 * címmel esetlegesen már létező sort (a {@code users.name}/{@code users.email} UNIQUE
 * megszorítás miatt egy megszakadt korábbi futásból maradt rekord egyébként minden
 * későbbi futást elrontana).
 */
@Component
@RequiredArgsConstructor
public class AuthTestSupport {

    /**
     * Az összes teszt-felhasználó nyers (nem kódolt) jelszava — egyetlen forrás,
     * amit a login-flow-t ellenőrző tesztek is felhasználhatnak.
     */
    public static final String TEST_PASSWORD = "Secret123!";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public User createUser(String email, UserRole role) {
        deleteUser(email);

        String namePrefix = email.contains("@") ? email.substring(0, email.indexOf('@')) : email;

        User user = User.builder()
                .name(namePrefix)
                .email(email)
                .password(passwordEncoder.encode(TEST_PASSWORD))
                .role(role)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build();

        return userRepository.save(user);
    }

    public String bearerToken(String email) {
        return "Bearer " + jwtUtil.generateJwtToken(email);
    }

    public void deleteUser(String email) {
        userRepository.findByEmail(email).ifPresent(userRepository::delete);
    }
}
