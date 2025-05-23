-- Admin felhasználó beszúrása (egyedi email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('Admin', 'admin@meditrack.hu', 'adminpass', 'ADMIN', true, now())
ON CONFLICT (email) DO NOTHING;

-- Teszt felhasználó beszúrása (email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('test', 'test@test.hu', '$2a$10$YNBGD.VXFtiLfljxbETaz.OJQ4uIcKGYBJDTa/qOYNla./EJx6SfG', 'USER', true, now())
ON CONFLICT (email) DO NOTHING;

-- Másik teszt felhasználó fix ID-val (ha szükséges)
INSERT INTO users (id, name, email, password, role, is_active, registration_date)
VALUES (9999, 'tesztfelhasználó', 'teszt@example.com', 'hashed_password', 'USER', true, now())
ON CONFLICT (email) DO NOTHING;