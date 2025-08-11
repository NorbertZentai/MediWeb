-- Flyway migration: Add missing columns to medications table and create push_subscriptions table
-- V2025.08.11.22.28__Add_missing_medication_columns_and_push_subscriptions.sql

-- Add missing columns to medications table
ALTER TABLE medications ADD COLUMN IF NOT EXISTS packaging VARCHAR(100);
ALTER TABLE medications ADD COLUMN IF NOT EXISTS release_date DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(200);

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh VARCHAR(255),
    auth VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
