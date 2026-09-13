package hu.project.MediWeb.modules.notification.controller;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Profile;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Issue #46 — a NotificationTestController ma kikommentezett @RestController miatt inaktív;
 * ha valaki visszakapcsolja, ADMIN-ra és a "dev" profilra kell korlátozni, hogy bármely
 * bejelentkezett user ne tudja kézzel elindítani az összes emlékeztető kiküldését.
 * <p>
 * Nem integrációs (Spring-context) tesztként íródott, mert a kontroller ma szándékosan nincs
 * regisztrálva Spring bean-ként (nincs @Component-jellegű annotáció) — egy MockMvc-alapú
 * teszt így "véletlenül zöld" lenne a jelenlegi (nem javított) állapotban is. A cél annotáció
 * reflexióval ellenőrizhető, és jelenleg helyesen PIROS, mert egyik elvárt annotáció sincs jelen.
 */
class NotificationTestControllerAnnotationTest {

    @Test
    void controllerIsRestControllerLimitedToDevProfile() {
        assertThat(NotificationTestController.class.isAnnotationPresent(RestController.class))
                .as("NotificationTestController-nek aktív @RestController-nek kell lennie")
                .isTrue();

        Profile profile = NotificationTestController.class.getAnnotation(Profile.class);
        assertThat(profile)
                .as("NotificationTestController-t a 'dev' profilra kell korlátozni")
                .isNotNull();
        assertThat(profile.value()).contains("dev");
    }

    @Test
    void testNotificationEndpointRequiresAdminRole() throws NoSuchMethodException {
        Method method = NotificationTestController.class.getMethod("testNotification");
        PreAuthorize preAuthorize = method.getAnnotation(PreAuthorize.class);

        assertThat(preAuthorize)
                .as("testNotification()-nek @PreAuthorize(hasRole('ADMIN'))-nal védettnek kell lennie")
                .isNotNull();
        assertThat(preAuthorize.value()).contains("ADMIN");
    }
}
