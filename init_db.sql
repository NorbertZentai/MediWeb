-- Database initialization script
CREATE SCHEMA IF NOT EXISTS public;

GRANT ALL ON SCHEMA public TO postgres;

CREATE TABLE IF NOT EXISTS public.users (
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
    profile_picture BYTEA,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'hu',
    deleted_at TIMESTAMP,
    CONSTRAINT unique_user_name_email UNIQUE (name, email)
);

CREATE TABLE IF NOT EXISTS public.profiles (
   id SERIAL PRIMARY KEY,
   user_id INTEGER NOT NULL REFERENCES public.users(id),
   name VARCHAR(100) NOT NULL,
   notes TEXT,
   CONSTRAINT unique_profile_per_user UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS public.medications (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url TEXT,
    registration_number VARCHAR(100),
    substance VARCHAR(255),
    atc_code VARCHAR(100),
    company VARCHAR(255),
    legal_basis VARCHAR(100),
    status VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.profile_medications (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    medication_id INTEGER NOT NULL REFERENCES public.medications(id),
    notes TEXT,
    reminders TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_profile_medication UNIQUE (profile_id, medication_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id),
    medication_id INTEGER NOT NULL REFERENCES public.medications(id),
    CONSTRAINT unique_favorite_per_user UNIQUE (user_id, medication_id)
);

CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES public.medications(id),
    user_id INTEGER NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL,
    positive TEXT,
    negative TEXT,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT unique_user_review UNIQUE (user_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.medication_intake_log (
    id SERIAL PRIMARY KEY,
    profile_medication_id INTEGER NOT NULL REFERENCES public.profile_medications(id) ON DELETE CASCADE,
    intake_date DATE NOT NULL,
    intake_time TIME NOT NULL,
    taken BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (profile_medication_id, intake_date, intake_time)
);

CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id INTEGER PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    preferences_payload TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_data_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- ==================== INDEXES ====================

-- users: email lookup (login, JWT validation)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- profiles: user's profiles lookup
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- medications: active medication filtering + search
CREATE INDEX IF NOT EXISTS idx_medications_active_status ON public.medications(is_active, status);
CREATE INDEX IF NOT EXISTS idx_medications_atc_code ON public.medications(atc_code);
CREATE INDEX IF NOT EXISTS idx_medications_name ON public.medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_last_updated ON public.medications(last_updated);

-- profile_medications: compound lookup
CREATE INDEX IF NOT EXISTS idx_profile_medications_profile ON public.profile_medications(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_medications_medication ON public.profile_medications(medication_id);

-- favorites: user's favorites lookup
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_medication_id ON public.favorites(medication_id);

-- reviews: medication reviews + user history
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON public.reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);

-- medication_intake_log: date range queries for statistics
CREATE INDEX IF NOT EXISTS idx_intake_log_profile_med ON public.medication_intake_log(profile_medication_id);
CREATE INDEX IF NOT EXISTS idx_intake_log_date ON public.medication_intake_log(intake_date);
CREATE INDEX IF NOT EXISTS idx_intake_log_taken ON public.medication_intake_log(profile_medication_id, taken);

-- user_data_requests: GDPR request tracking
CREATE INDEX IF NOT EXISTS idx_data_requests_user_status ON public.user_data_requests(user_id, status);

-- expo_push_tokens: push notification delivery (table may not exist yet)
-- CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON public.expo_push_tokens(user_id);

-- Admin felhasználó beszúrása (egyedi email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('Admin', 'zentai.norbert96@gmail.com', 'adminpass', 'ADMIN', true, now())
ON CONFLICT (email) DO NOTHING;

-- Teszt felhasználó beszúrása (email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('test', '96nucu@gmail.com', '$2a$10$YNBGD.VXFtiLfljxbETaz.OJQ4uIcKGYBJDTa/qOYNla./EJx6SfG', 'USER', true, now())
ON CONFLICT (email) DO NOTHING;

-- ==================== REVIEW MODERATION ====================

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS checked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reported BOOLEAN NOT NULL DEFAULT false;

-- ==================== REVIEW REPORTS ====================

CREATE TABLE IF NOT EXISTS review_reports (
    id BIGSERIAL PRIMARY KEY,
    review_id BIGINT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(50) NOT NULL,
    comment VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(review_id, reporter_id)
);

-- OTP Email ellenőrző tokenek
CREATE TABLE IF NOT EXISTS verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);
