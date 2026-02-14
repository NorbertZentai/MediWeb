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

-- Ensure user_preferences table exists for storing JSON payload of per-user settings
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    preferences_payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure expo_push_tokens table exists for storing Expo push notification tokens
CREATE TABLE IF NOT EXISTS expo_push_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure push_notifications_enabled column exists on users
DO $$
BEGIN
    BEGIN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT TRUE;
        UPDATE users SET push_notifications_enabled = TRUE WHERE push_notifications_enabled IS NULL;
        ALTER TABLE users ALTER COLUMN push_notifications_enabled SET DEFAULT TRUE;
        ALTER TABLE users ALTER COLUMN push_notifications_enabled SET NOT NULL;
        RAISE NOTICE 'Ensured push_notifications_enabled column exists on users table';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Skipped push_notifications_enabled migration: %', SQLERRM;
    END;
END $$;

-- Ensure user_data_requests table exists for export and deletion workflows
CREATE TABLE IF NOT EXISTS user_data_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Add recorded_at column to medication_intake_log for tracking when intake was recorded
ALTER TABLE medication_intake_log ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMP;
