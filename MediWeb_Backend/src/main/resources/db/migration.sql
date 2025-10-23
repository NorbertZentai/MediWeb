-- Migration script to update database schema
-- Automatically runs on application startup
-- Updated: 2025-08-11 22:25 - FORCE EXECUTION

-- Remove legacy push_subscriptions table now that web push support has been retired
DROP TABLE IF EXISTS push_subscriptions CASCADE;

-- Add missing columns to medications table (PostgreSQL supports ADD COLUMN IF NOT EXISTS since version 9.6)
DO $$
BEGIN
    -- Ensure email notification preference column exists
    BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT TRUE;
        UPDATE users
        SET email_notifications_enabled = TRUE
        WHERE email_notifications_enabled IS NULL;
        ALTER TABLE users ALTER COLUMN email_notifications_enabled SET DEFAULT TRUE;
        ALTER TABLE users ALTER COLUMN email_notifications_enabled SET NOT NULL;
        RAISE NOTICE 'Ensured email_notifications_enabled column exists on users table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Skipped email_notifications_enabled migration: %', SQLERRM;
    END;

    -- Add packaging column
    BEGIN
        ALTER TABLE medications ADD COLUMN packaging VARCHAR(100);
        RAISE NOTICE 'Added packaging column to medications table';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column packaging already exists in medications table';
    END;
    
    -- Add release_date column
    BEGIN
        ALTER TABLE medications ADD COLUMN release_date DATE;
        RAISE NOTICE 'Added release_date column to medications table';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column release_date already exists in medications table';
    END;
    
    -- Add description column
    BEGIN
        ALTER TABLE medications ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to medications table';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column description already exists in medications table';
    END;
    
    -- Add manufacturer column
    BEGIN
        ALTER TABLE medications ADD COLUMN manufacturer VARCHAR(200);
        RAISE NOTICE 'Added manufacturer column to medications table';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'Column manufacturer already exists in medications table';
    END;
    
    RAISE NOTICE 'Migration script completed successfully!';
END $$;
