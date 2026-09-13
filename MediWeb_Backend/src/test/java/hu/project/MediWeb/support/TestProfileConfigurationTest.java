package hu.project.MediWeb.support;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Igazolja, hogy az integrációs tesztek a dedikált 'test' Spring profillal futnak,
 * és a dev seed script ki van kapcsolva ({@code spring.sql.init.mode=never}).
 */
class TestProfileConfigurationTest extends AbstractIntegrationTest {

    @Autowired
    private Environment environment;

    @Test
    @DisplayName("Az aktív profil 'test', és a spring.sql.init.mode 'never'")
    void activeProfileIsTest_andSeedScriptDisabled() {
        assertThat(environment.getActiveProfiles()).contains("test");
        assertThat(environment.getProperty("spring.sql.init.mode")).isEqualTo("never");
    }
}
