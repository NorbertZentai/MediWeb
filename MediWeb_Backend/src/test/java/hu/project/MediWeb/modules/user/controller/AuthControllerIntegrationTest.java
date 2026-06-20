package hu.project.MediWeb.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.security.JwtUtil;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integrációs tesztek az auth HTTP-flow-hoz (MockMvc + teljes security filter lánc,
 * valódi PostgreSQL konténer ellen).
 * Egy aktív felhasználót közvetlenül az adatbázisba seedelünk (kihagyva a regisztráció
 * email-küldését és verifikációs kapuját), és ezzel teszteljük a login + JWT folyamatot,
 * valamint a védett /auth/me endpoint token nélküli (401) és érvényes tokennel (200) elérését.
 */
class AuthControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String EMAIL = "integration@test.com";
    private static final String RAW_PASSWORD = "Secret123!";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void seedActiveUser() {
        userRepository.findByEmail(EMAIL).ifPresent(userRepository::delete);
        User user = User.builder()
                .name("integration-user")
                .email(EMAIL)
                .password(passwordEncoder.encode(RAW_PASSWORD))
                .role(UserRole.USER)
                .is_active(true)
                .registration_date(LocalDateTime.now())
                .build();
        userRepository.save(user);
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    @Test
    @DisplayName("POST /auth/login: helyes adatokkal 200 + JWT tokent ad vissza")
    void login_returnsJwtToken_forValidCredentials() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", EMAIL, "password", RAW_PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", is(notNullValue())))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.user.email", is(EMAIL)));
    }

    @Test
    @DisplayName("POST /auth/login: rossz jelszóval 401")
    void login_returns401_forWrongPassword() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", EMAIL, "password", "WrongPassword"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /auth/me: token nélkül 401 (védett endpoint)")
    void me_returns401_withoutToken() throws Exception {
        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /auth/me: érvényes JWT tokennel 200 + a felhasználó adatai")
    void me_returns200_withValidToken() throws Exception {
        String token = jwtUtil.generateJwtToken(EMAIL);

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(EMAIL)))
                .andExpect(jsonPath("$.role", is("USER")));
    }
}
