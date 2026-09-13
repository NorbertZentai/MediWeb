package hu.project.MediWeb.modules.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import hu.project.MediWeb.modules.user.dto.PasswordConfirmationRequest;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import hu.project.MediWeb.support.AuthTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integrációs tesztek a UserController admin végpontjainak jogosultság-korlátozásához
 * (issue #45): a /api/users adminisztratív végpontjai csak ROLE_ADMIN számára érhetők el,
 * DTO-t adnak vissza (soha nem password/totpSecret mezőt), és a self-role-change,
 * ismeretlen role, illetve nem létező id esetek megfelelő HTTP státuszt adnak.
 */
class UserControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String ADMIN_EMAIL = "admin-45@test.com";
    private static final String USER_EMAIL = "user-45@test.com";
    private static final String OTHER_USER_EMAIL = "other-45@test.com";

    @Autowired
    private AuthTestSupport authTestSupport;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ObjectMapper objectMapper;

    private User admin;
    private User user;
    private User otherUser;

    @BeforeEach
    void seedUsers() {
        admin = authTestSupport.createUser(ADMIN_EMAIL, UserRole.ADMIN);
        user = authTestSupport.createUser(USER_EMAIL, UserRole.USER);
        otherUser = authTestSupport.createUser(OTHER_USER_EMAIL, UserRole.USER);
    }

    private String adminToken() {
        return authTestSupport.bearerToken(ADMIN_EMAIL);
    }

    private String userToken() {
        return authTestSupport.bearerToken(USER_EMAIL);
    }

    @Test
    @DisplayName("GET /api/users: USER tokennel 403, token nélkül 401")
    void getAllUsers_forbiddenForUser_unauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", userToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/users: USER tokennel 403, token nélkül 401")
    void createUser_forbiddenForUser_unauthorizedWithoutToken() throws Exception {
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "name", "new-user-45",
                "email", "new-user-45@test.com",
                "password", "Whatever123!"));

        mockMvc.perform(post("/api/users")
                        .header("Authorization", userToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/users/{id}: USER tokennel 403, token nélkül 401")
    void getUserById_forbiddenForUser_unauthorizedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/users/{id}", otherUser.getId()).header("Authorization", userToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/users/{id}", otherUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("DELETE /api/users/{id}: USER tokennel 403, token nélkül 401")
    void deleteUser_forbiddenForUser_unauthorizedWithoutToken() throws Exception {
        mockMvc.perform(delete("/api/users/{id}", otherUser.getId()).header("Authorization", userToken()))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/users/{id}", otherUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role: USER tokennel 403, token nélkül 401")
    void updateUserRole_forbiddenForUser_unauthorizedWithoutToken() throws Exception {
        mockMvc.perform(put("/api/users/{id}/role", otherUser.getId())
                        .header("Authorization", userToken())
                        .param("role", "ADMIN"))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/users/{id}/role", otherUser.getId())
                        .param("role", "ADMIN"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/users: ADMIN tokennel 200, UserDTO-kat ad vissza password/totpSecret nélkül")
    void getAllUsers_returnsDtoListWithoutSecrets_forAdmin() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", adminToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[0].totpSecret").doesNotExist());
    }

    @Test
    @DisplayName("PUT /api/users/{sajátId}/role: ADMIN saját magát nem léptetheti - 403, DB-ben változatlan")
    void updateOwnRole_forbidden_dbUnchanged() throws Exception {
        mockMvc.perform(put("/api/users/{id}/role", admin.getId())
                        .header("Authorization", adminToken())
                        .param("role", "USER"))
                .andExpect(status().isForbidden());

        User reloaded = userRepository.findById(admin.getId()).orElseThrow();
        assertThat(reloaded.getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    @DisplayName("PUT /api/users/{másikId}/role: ADMIN tokennel 200, DB-ben frissül")
    void updateOtherUserRole_succeeds_dbUpdated() throws Exception {
        mockMvc.perform(put("/api/users/{id}/role", otherUser.getId())
                        .header("Authorization", adminToken())
                        .param("role", "ADMIN"))
                .andExpect(status().isOk());

        User reloaded = userRepository.findById(otherUser.getId()).orElseThrow();
        assertThat(reloaded.getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role: ismeretlen role 400-at ad")
    void updateUserRole_unknownRole_returnsBadRequest() throws Exception {
        mockMvc.perform(put("/api/users/{id}/role", otherUser.getId())
                        .header("Authorization", adminToken())
                        .param("role", "SUPER"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /api/users/{id}/role: nem létező id 404-et ad")
    void updateUserRole_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(put("/api/users/{id}/role", 999_999_999L)
                        .header("Authorization", adminToken())
                        .param("role", "ADMIN"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/users/{id}: nem létező id 404-et ad")
    void getUserById_unknownId_returnsNotFound() throws Exception {
        mockMvc.perform(get("/api/users/{id}", 999_999_999L).header("Authorization", adminToken()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Regresszió: USER tokennel GET /api/users/preferences 200, DELETE /api/users/me helyes jelszóval 204")
    void selfServiceEndpoints_remainAccessibleForUser() throws Exception {
        mockMvc.perform(get("/api/users/preferences").header("Authorization", userToken()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/users/me")
                        .header("Authorization", userToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new PasswordConfirmationRequest(AuthTestSupport.TEST_PASSWORD))))
                .andExpect(status().isNoContent());
    }
}
