package hu.project.MediWeb.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DatabaseMigrationRunner implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🔄 Running database migration checks...");
        
        try {
            // Check and add missing columns to medications table
            addColumnIfNotExists("medications", "packaging", "VARCHAR(100)");
            addColumnIfNotExists("medications", "release_date", "DATE");
            addColumnIfNotExists("medications", "description", "TEXT");
            addColumnIfNotExists("medications", "manufacturer", "VARCHAR(200)");
            
            // Create push_subscriptions table if not exists
            createPushSubscriptionsTable();
            
            System.out.println("✅ Database migration completed successfully!");
            
        } catch (Exception e) {
            System.err.println("❌ Database migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private void addColumnIfNotExists(String tableName, String columnName, String columnType) {
        try {
            String checkSql = "SELECT column_name FROM information_schema.columns " +
                             "WHERE table_name = ? AND column_name = ?";
            
            int count = jdbcTemplate.queryForList(checkSql, tableName, columnName).size();
            
            if (count == 0) {
                String addColumnSql = "ALTER TABLE " + tableName + " ADD COLUMN " + columnName + " " + columnType;
                jdbcTemplate.execute(addColumnSql);
                System.out.println("✅ Added column: " + tableName + "." + columnName);
            } else {
                System.out.println("ℹ️ Column already exists: " + tableName + "." + columnName);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to add column " + tableName + "." + columnName + ": " + e.getMessage());
        }
    }
    
    private void createPushSubscriptionsTable() {
        try {
            String checkTableSql = "SELECT to_regclass('push_subscriptions')";
            String result = jdbcTemplate.queryForObject(checkTableSql, String.class);
            
            if (result == null) {
                String createTableSql = """
                    CREATE TABLE push_subscriptions (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        endpoint TEXT NOT NULL,
                        p256dh VARCHAR(255),
                        auth VARCHAR(255),
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                    """;
                    
                jdbcTemplate.execute(createTableSql);
                System.out.println("✅ Created table: push_subscriptions");
            } else {
                System.out.println("ℹ️ Table already exists: push_subscriptions");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to create push_subscriptions table: " + e.getMessage());
        }
    }
}
