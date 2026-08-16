package hu.project.MediWeb.support;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Közös alaposztály az integrációs tesztekhez.
 * <p>
 * A teljes Spring kontextust felhúzza ({@code MockMvc} + valódi security filter lánc) egy
 * <b>valódi PostgreSQL</b> adatbázis ellen, amit a környezet biztosít (a {@code spring.datasource}
 * konfigurációból): lokálisan a futó Postgres konténer, CI-ben egy Postgres service-konténer.
 * Így nem H2-vel "csalunk", hanem éles adatbázis-motorral tesztelünk.
 * <p>
 * A dev seed script ({@code db/data.sql}) tesztekben ki van kapcsolva: a tesztek maguk seedelik
 * a szükséges adatot, így nem függenek a fejlesztői minta-rekordoktól.
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = "spring.sql.init.mode=never")
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;
}
