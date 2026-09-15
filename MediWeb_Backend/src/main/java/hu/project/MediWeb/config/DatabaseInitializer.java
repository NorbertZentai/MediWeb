package hu.project.MediWeb.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("🗄️ Checking database tables...");
            
            // Check if users table exists
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users'", 
                Integer.class
            );
            
            if (count != null && count == 0) {
                System.out.println("📝 Creating database tables...");

                applySchema(jdbcTemplate);

                System.out.println("✅ Database tables created successfully!");
                
                // Read and execute data.sql
                ClassPathResource dataResource = new ClassPathResource("db/data.sql");
                String dataSql = new String(dataResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
                
                String[] dataStatements = dataSql.split(";");
                for (String statement : dataStatements) {
                    statement = statement.trim();
                    if (!statement.isEmpty() && !statement.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(statement);
                        } catch (Exception e) {
                            System.out.println("⚠️ Warning executing data statement: " + e.getMessage());
                        }
                    }
                }
                
                System.out.println("✅ Initial data inserted successfully!");
            } else {
                System.out.println("✅ Database tables already exist");
            }

            ensureEmailNotificationsColumn();
            ensureMedicationExtraColumns();
        } catch (Exception e) {
            System.err.println("❌ Database initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Reads {@code db/schema.sql} and executes each non-empty, semicolon-separated statement
     * via the given {@link JdbcTemplate}.
     * <p>
     * Package-private on purpose (not {@code private}): it lets
     * {@code DatabaseInitializerSchemaIntegrationTest}, in this same package, invoke schema
     * application a second time against an already-initialized database, proving that
     * schema.sql's {@code IF NOT EXISTS} / {@code ADD COLUMN IF NOT EXISTS} statements are safe
     * to re-run. Called once by {@link #run(String...)} during normal application startup, and
     * once more directly by that test for the idempotency proof.
     */
    void applySchema(JdbcTemplate jdbcTemplate) throws IOException {
        ClassPathResource schemaResource = new ClassPathResource("db/schema.sql");
        String schemaSql = new String(schemaResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);

        // Split by semicolon and execute each statement
        String[] statements = schemaSql.split(";");
        for (String statement : statements) {
            statement = statement.trim();
            if (!statement.isEmpty()) {
                jdbcTemplate.execute(statement);
            }
        }
    }

    private void ensureEmailNotificationsColumn() {
        try {
            Integer columnCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_notifications_enabled'",
                    Integer.class
            );

            if (columnCount == null || columnCount == 0) {
                System.out.println("🛠️ Adding email_notifications_enabled column to users table...");
                jdbcTemplate.execute("ALTER TABLE users ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT TRUE");
                jdbcTemplate.execute("UPDATE users SET email_notifications_enabled = TRUE WHERE email_notifications_enabled IS NULL");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_notifications_enabled SET DEFAULT TRUE");
                jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_notifications_enabled SET NOT NULL");
                System.out.println("✅ email_notifications_enabled column ensured on users table");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to ensure email_notifications_enabled column: " + e.getMessage());
        }
    }

    private void ensureMedicationExtraColumns() {
        try {
            addColumnIfMissing("medications", "packaging", "ALTER TABLE medications ADD COLUMN packaging VARCHAR(100)");
            addColumnIfMissing("medications", "release_date", "ALTER TABLE medications ADD COLUMN release_date DATE");
            addColumnIfMissing("medications", "description", "ALTER TABLE medications ADD COLUMN description TEXT");
            addColumnIfMissing("medications", "manufacturer", "ALTER TABLE medications ADD COLUMN manufacturer VARCHAR(200)");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to ensure medication extra columns: " + e.getMessage());
        }
    }

    private void addColumnIfMissing(String tableName, String columnName, String alterStatement) {
        Integer columnCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = ? AND column_name = ?",
                Integer.class,
                tableName,
                columnName
        );

        if (columnCount == null || columnCount == 0) {
            System.out.println("🛠️ Adding column " + columnName + " to table " + tableName + "...");
            jdbcTemplate.execute(alterStatement);
            System.out.println("✅ Column " + columnName + " added to table " + tableName);
        }
    }
}
