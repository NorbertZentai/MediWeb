package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.web.SpringJUnitWebConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.webAppContextSetup;

/**
 * Issue #58 — futásidőben ellenőrzi, hogy a {@code /api/test-notification} végpont csak a "dev"
 * profilban létezik, és ott csak ADMIN szerepkörrel hívható.
 * <p>
 * Szándékosan NEM {@code @SpringBootTest}: a valódi "dev" profil ({@code application-dev.yml})
 * dotenv importot, mail-t, adatbázist, Flyway-t és cron-t is felhúzna, ami környezetfüggővé
 * tenné a tesztet. Ehelyett egy minimál, tiszta Spring (nem Boot) web+security kontextust
 * építünk fel, ami csak a {@link NotificationTestController}-t importálja egy Mockito mock
 * {@link NotificationService} mellé, és egy minimál {@link SecurityFilterChain}-t definiál
 * (bármely hitelesített kérést enged tovább — a tényleges ADMIN-korlátozást a kontrolleren lévő
 * {@code @PreAuthorize} kényszeríti ki, amit az {@code @EnableMethodSecurity} aktivál).
 */
class NotificationTestControllerDevProfileTest {

    // @TestConfiguration (rather than @Configuration): Spring Boot's component-scan exclude
    // filter skips @TestConfiguration classes, so this nested class is never auto-detected by
    // the real application's @SpringBootTest contexts (e.g. AbstractIntegrationTest) sharing the
    // same base package - it is only ever registered explicitly via @SpringJUnitWebConfig below.
    @TestConfiguration
    @EnableWebMvc
    @EnableWebSecurity
    @EnableMethodSecurity
    @Import(NotificationTestController.class)
    static class MinimalDevWebSecurityConfig {

        @Bean
        NotificationService notificationService() {
            return Mockito.mock(NotificationService.class);
        }

        @Bean
        SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                    .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
            return http.build();
        }
    }

    @SpringJUnitWebConfig(classes = MinimalDevWebSecurityConfig.class)
    @ActiveProfiles("dev")
    @Nested
    class DevProfileActive {

        @Autowired
        private WebApplicationContext webApplicationContext;

        @Autowired
        private NotificationService notificationService;

        private MockMvc mockMvc;

        @BeforeEach
        void setUp() {
            mockMvc = webAppContextSetup(webApplicationContext)
                    .apply(springSecurity())
                    .build();
            Mockito.reset(notificationService);
        }

        @Test
        @DisplayName("'dev' profilban a NotificationTestController regisztrálva van bean-ként")
        void controllerBeanIsPresent() {
            assertThat(webApplicationContext.getBeansOfType(NotificationTestController.class)).hasSize(1);
        }

        @Test
        @WithMockUser(roles = "USER")
        @DisplayName("GET /api/test-notification: USER szerepkörrel 403, a NotificationService-t nem hívja")
        void userRole_returns403_andNeverCallsService() throws Exception {
            mockMvc.perform(get("/api/test-notification"))
                    .andExpect(status().isForbidden());

            verify(notificationService, never()).sendScheduledReminders();
        }

        @Test
        @WithMockUser(roles = "ADMIN")
        @DisplayName("GET /api/test-notification: ADMIN szerepkörrel 200, a törzs helyes, a szolgáltatást pontosan egyszer hívja")
        void adminRole_returns200_withBody_andCallsServiceOnce() throws Exception {
            mockMvc.perform(get("/api/test-notification"))
                    .andExpect(status().isOk())
                    .andExpect(content().string("Notification check lefutott!"));

            verify(notificationService, times(1)).sendScheduledReminders();
        }

        @Test
        @DisplayName("GET /api/test-notification: hitelesítés nélkül nem 200, a NotificationService-t nem hívja")
        void anonymous_isNot200_andNeverCallsService() throws Exception {
            mockMvc.perform(get("/api/test-notification"))
                    .andExpect(result -> {
                        int status = result.getResponse().getStatus();
                        assertThat(status)
                                .as("hitelesítetlen kérésre nem szabad 200-at adni")
                                .isIn(401, 403);
                    });

            verify(notificationService, never()).sendScheduledReminders();
        }
    }

    @SpringJUnitWebConfig(classes = MinimalDevWebSecurityConfig.class)
    @Nested
    class NoActiveProfile {

        @Autowired
        private ApplicationContext applicationContext;

        @Test
        @DisplayName("aktív profil nélkül a NotificationTestController nincs regisztrálva bean-ként")
        void controllerBeanIsAbsentWithoutDevProfile() {
            assertThat(applicationContext.getBeansOfType(NotificationTestController.class)).isEmpty();
        }
    }
}
