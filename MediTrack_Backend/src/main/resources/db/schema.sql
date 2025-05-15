DROP TABLE IF EXISTS profile_medications CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(10),
    date_of_birth VARCHAR(255),
    address TEXT,
    phone_number VARCHAR(200),
    registration_date TIMESTAMP,
    last_login TIMESTAMP,
    profile_picture TEXT,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'hu',
    deleted_at TIMESTAMP
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    notes TEXT,
    relationship VARCHAR(50),
    health_condition TEXT,
    emergency_contact VARCHAR(20),
    address TEXT
);

CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(200),
    description TEXT,
    packaging VARCHAR(100),
    release_date DATE,
    average_rating NUMERIC(2,2) DEFAULT 0
);

CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    medication_id INTEGER REFERENCES medications(id)
);
