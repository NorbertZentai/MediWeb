package hu.project.MediWeb.support;

import hu.project.MediWeb.modules.user.enums.UserRole;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Igazolja, hogy az {@link AuthTestSupport} által előállított JWT tokenek ténylegesen
 * hitelesítik a felhasználót a security filter láncon: a token nélküli és hibás tokenes
 * kérés 401-et ad, egy érvényes (USER vagy ADMIN szerepkörű) tokennel a kérés átmegy.
 */
class AuthTestSupportTest extends AbstractIntegrationTest {

    private static final String USER_EMAIL = "auth-support-user-it@test.com";
    private static final String ADMIN_EMAIL = "auth-support-admin-it@test.com";
    private static final String PREFERENCES_ENDPOINT = "/api/users/preferences";

    @Autowired
    private AuthTestSupport authTestSupport;

    @AfterEach
    void cleanUp() {
        authTestSupport.deleteUser(USER_EMAIL);
        authTestSupport.deleteUser(ADMIN_EMAIL);
    }

    @Test
    @DisplayName("USER szerepkörű token hozzáférést ad egy hitelesített végponthoz")
    void userToken_grantsAccessToAuthenticatedEndpoint() throws Exception {
        authTestSupport.createUser(USER_EMAIL, UserRole.USER);

        mockMvc.perform(get(PREFERENCES_ENDPOINT)
                        .header("Authorization", authTestSupport.bearerToken(USER_EMAIL)))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    @DisplayName("ADMIN szerepkörű token hozzáférést ad egy hitelesített végponthoz")
    void adminToken_grantsAccessToAuthenticatedEndpoint() throws Exception {
        authTestSupport.createUser(ADMIN_EMAIL, UserRole.ADMIN);

        mockMvc.perform(get(PREFERENCES_ENDPOINT)
                        .header("Authorization", authTestSupport.bearerToken(ADMIN_EMAIL)))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    @DisplayName("Token nélkül 401")
    void noToken_returns401() throws Exception {
        mockMvc.perform(get(PREFERENCES_ENDPOINT))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Hibás tokennel 401")
    void invalidToken_returns401() throws Exception {
        mockMvc.perform(get(PREFERENCES_ENDPOINT)
                        .header("Authorization", "Bearer this-is-not-a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }
}
