-- Migration script to update database schema
-- Automatically runs on application startup
-- Updated: 2025-08-11 22:25 - FORCE EXECUTION

-- Drop and recreate push_subscriptions table to ensure it exists
DROP TABLE IF EXISTS push_subscriptions CASCADE;

CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255),
    auth VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to medications table (PostgreSQL supports ADD COLUMN IF NOT EXISTS since version 9.6)
DO $$
BEGIN
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
