package hu.project.MediWeb.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Proves that {@code db/schema.sql} (applied by {@link DatabaseInitializer}) genuinely
 * initializes a fresh PostgreSQL database of the same major version used in
 * {@code docker-compose.dev.yml}, and that re-applying it is idempotent.
 * <p>
 * The container mirrors docker-compose.dev.yml's credentials (POSTGRES_USER/PASSWORD/DB =
 * postgres/postgres/mediweb) because schema.sql's {@code GRANT ALL ON SCHEMA public TO postgres;}
 * statement requires a 'postgres' superuser role to exist; Testcontainers' default superuser is
 * 'test' unless overridden. Hibernate's ddl-auto is forced to {@code none} for this test so the
 * assertions genuinely exercise schema.sql rather than JPA entity-mapping DDL generation.
 * <p>
 * Uses the default (MOCK) web environment rather than {@code WebEnvironment.NONE}: with NONE,
 * {@code spring.main.web-application-type=none} disables the servlet-conditioned Spring Security
 * autoconfiguration that provides the {@code AuthenticationConfiguration} bean, which
 * {@code SecurityConfig}'s {@code AuthenticationManager} bean needs — the context would then fail
 * to start at all. MOCK matches every other {@code *IntegrationTest} in this codebase.
 */
@SpringBootTest
@ActiveProfiles("test")
@Testcontainers
class DatabaseInitializerSchemaIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine")
            .withUsername("postgres")
            .withPassword("postgres")
            .withDatabaseName("mediweb");

    @DynamicPropertySource
    static void overrideProperties(DynamicPropertyRegistry registry) {
        // Prove schema.sql (not Hibernate's own DDL generation) creates the schema on first boot.
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
    }

    @Autowired
    private DatabaseInitializer databaseInitializer;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void schemaSqlCreatesExpectedTablesAndColumns() {
        assertTableExists("users");
        assertTableExists("profiles");
        assertTableExists("medications");

        assertColumnExists("users", "email_notifications_enabled");
        assertColumnExists("medications", "packaging");
        assertColumnExists("medications", "release_date");
        assertColumnExists("medications", "description");
        assertColumnExists("medications", "manufacturer");
    }

    @Test
    void applyingSchemaSqlAgainIsIdempotent() {
        assertDoesNotThrow(() -> databaseInitializer.applySchema(jdbcTemplate));
    }

    private void assertTableExists(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?",
                Integer.class,
                tableName
        );
        assertEquals(1, count, "Expected table '" + tableName + "' to exist");
    }

    private void assertColumnExists(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName
        );
        assertEquals(1, count, "Expected column '" + tableName + "." + columnName + "' to exist");
    }
}
