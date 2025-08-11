package hu.project.MediWeb.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

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
                
                // Read and execute schema.sql
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
        } catch (Exception e) {
            System.err.println("❌ Database initialization error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
