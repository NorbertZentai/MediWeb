package hu.project.MediWeb.modules.user.controller;

import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import hu.project.MediWeb.support.AuthTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import tools.jackson.databind.json.JsonMapper;

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

    @Autowired
    private AuthTestSupport authTestSupport;
    @Autowired
    private JsonMapper objectMapper;

    @BeforeEach
    void seedActiveUser() {
        authTestSupport.createUser(EMAIL, UserRole.USER);
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    @Test
    @DisplayName("POST /auth/login: helyes adatokkal 200 + JWT tokent ad vissza")
    void login_returnsJwtToken_forValidCredentials() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", EMAIL, "password", AuthTestSupport.TEST_PASSWORD))))
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
        String token = authTestSupport.bearerToken(EMAIL);

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(EMAIL)))
                .andExpect(jsonPath("$.role", is("USER")));
    }
}
