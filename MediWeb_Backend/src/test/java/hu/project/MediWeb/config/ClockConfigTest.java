package hu.project.MediWeb.config;

import hu.project.MediWeb.support.AbstractIntegrationTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Clock;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Spring kontextus teszt: az autowired {@link Clock} bean Europe/Budapest zónájú.
 */
class ClockConfigTest extends AbstractIntegrationTest {

    @Autowired
    private Clock clock;

    @Test
    @DisplayName("A Clock bean zónája Europe/Budapest")
    void clockBean_hasBudapestZone() {
        assertThat(clock.getZone()).isEqualTo(ZoneId.of("Europe/Budapest"));
    }
}
