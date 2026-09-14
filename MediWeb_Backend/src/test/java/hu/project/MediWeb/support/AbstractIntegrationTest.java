package hu.project.MediWeb.support;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Közös alaposztály az integrációs tesztekhez.
 * <p>
 * A teljes Spring kontextust felhúzza ({@code MockMvc} + valódi security filter lánc) egy
 * <b>valódi PostgreSQL</b> adatbázis ellen, amit a környezet biztosít (a {@code spring.datasource}
 * konfigurációból): lokálisan a futó Postgres konténer, CI-ben egy Postgres service-konténer.
 * Így nem H2-vel "csalunk", hanem éles adatbázis-motorral tesztelünk.
 * <p>
 * A dedikált {@code test} Spring profil ({@code application-test.yml}) fut: a datasource
 * környezeti változókból jön, a dev seed script ({@code db/data.sql}) ki van kapcsolva
 * ({@code spring.sql.init.mode=never}), és fix, szintetikus jwt.secret-tel dolgozunk —
 * így a tesztek nem függenek a 'dev' profil konfigurációjától (mail, dotenv import,
 * medication sync cron). A szükséges adatot a tesztek maguk seedelik.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;
}
