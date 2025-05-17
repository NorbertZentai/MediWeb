-- USERS tábla létrehozása
CREATE TABLE IF NOT EXISTS users (
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
    deleted_at TIMESTAMP,
    CONSTRAINT unique_user_name_email UNIQUE (name, email)
);

-- PROFILES tábla létrehozása
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    notes TEXT,
    relationship VARCHAR(50),
    health_condition TEXT,
    emergency_contact VARCHAR(20),
    address TEXT,
    CONSTRAINT unique_profile_per_user UNIQUE (user_id, name)
);

-- MEDICATIONS tábla létrehozása
CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    image_url TEXT,
    registration_number VARCHAR(100),
    substance VARCHAR(255),
    atc_code VARCHAR(100),
    company VARCHAR(255),
    legal_basis VARCHAR(100),
    status VARCHAR(100),
    authorization_date DATE,
    narcotic VARCHAR(100),
    patient_info_url TEXT,
    smpc_url TEXT,
    label_url TEXT,
    contains_lactose BOOLEAN,
    contains_gluten BOOLEAN,
    contains_benzoate BOOLEAN,
    packages_json TEXT,
    substitutes_json TEXT,
    final_samples_json TEXT,
    defective_forms_json TEXT,
    hazipatika_json TEXT,
    CONSTRAINT unique_medication_identifier UNIQUE (registration_number)
);

-- FAVORITES tábla létrehozása
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    medication_id INTEGER NOT NULL REFERENCES medications(id),
    CONSTRAINT unique_favorite_per_user UNIQUE (user_id, medication_id)
);

-- REVIEW tábla létrehozása
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES medications(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    positive TEXT,
    negative TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_review UNIQUE (user_id, item_id)
);

-- PROFILE_MEDICATIONS tábla létrehozása
CREATE TABLE IF NOT EXISTS profile_medications (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES profiles(id),
    medication_id INTEGER NOT NULL REFERENCES medications(id),
    notes TEXT,
    start_date DATE,
    end_date DATE,
    CONSTRAINT unique_profile_medication UNIQUE (profile_id, medication_id)
);