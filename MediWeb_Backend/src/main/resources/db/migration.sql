-- Migration script to update database schema
-- Automatically runs on application startup

-- Add missing columns to medications table (PostgreSQL supports ADD COLUMN IF NOT EXISTS since version 9.6)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medications' AND column_name='packaging') THEN
        ALTER TABLE medications ADD COLUMN packaging VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medications' AND column_name='release_date') THEN
        ALTER TABLE medications ADD COLUMN release_date DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medications' AND column_name='description') THEN
        ALTER TABLE medications ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='medications' AND column_name='manufacturer') THEN
        ALTER TABLE medications ADD COLUMN manufacturer VARCHAR(200);
    END IF;
END $$;

-- Create push_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255),
    auth VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
