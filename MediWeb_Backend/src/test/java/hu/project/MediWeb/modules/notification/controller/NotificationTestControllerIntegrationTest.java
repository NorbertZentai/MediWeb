package hu.project.MediWeb.modules.notification.controller;

import hu.project.MediWeb.modules.notification.service.NotificationService;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import hu.project.MediWeb.support.AuthTestSupport;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #58 — futásidőben (nem csak reflexióval) ellenőrzi, hogy a {@code /api/test-notification}
 * végpont a "test" profil alatt (a teljes Spring kontextusban, valódi Postgres-szel és security
 * lánccal) nincs regisztrálva: a {@link NotificationTestController} maga is csak a "dev" profilban
 * él, tehát itt sem bean-ként nem érhető el, sem HTTP-n keresztül nem hívható (404).
 */
class NotificationTestControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String ADMIN_EMAIL = "notif-test-admin@test.com";

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private AuthTestSupport authTestSupport;

    @MockitoBean
    private NotificationService notificationService;

    @AfterEach
    void cleanup() {
        authTestSupport.deleteUser(ADMIN_EMAIL);
    }

    @Test
    @DisplayName("'test' profil alatt a NotificationTestController nincs regisztrálva bean-ként")
    void notificationTestControllerBeanIsAbsent() {
        assertThat(applicationContext.getBeansOfType(NotificationTestController.class)).isEmpty();
    }

    @Test
    @DisplayName("GET /api/test-notification: ADMIN tokennel is 404, mert a végpont nem létezik ebben a profilban")
    void getTestNotification_adminToken_returns404() throws Exception {
        authTestSupport.createUser(ADMIN_EMAIL, UserRole.ADMIN);
        String adminToken = authTestSupport.bearerToken(ADMIN_EMAIL);

        mockMvc.perform(get("/api/test-notification").header("Authorization", adminToken))
                .andExpect(status().isNotFound());

        verifyNoInteractions(notificationService);
    }

    @Test
    @DisplayName("GET /api/test-notification: token nélkül 401, a NotificationService-t nem hívja")
    void getTestNotification_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/test-notification"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(notificationService);
    }
}
