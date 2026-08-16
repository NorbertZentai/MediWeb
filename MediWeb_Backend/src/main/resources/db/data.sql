-- A NOT NULL kapcsoló-oszlopokat (email_notifications_enabled, push_notifications_enabled,
-- is_2fa_enabled) expliciten megadjuk: ha a táblát a Hibernate ddl-auto hozta létre és nem a
-- schema.sql, akkor nincs rajtuk DB-oldali DEFAULT, és az INSERT NOT NULL hibára futna.

-- Admin felhasználó beszúrása (egyedi email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date,
                   email_notifications_enabled, push_notifications_enabled, is_2fa_enabled)
VALUES ('Admin', 'zentai.norbert96@gmail.com', 'adminpass', 'ADMIN', true, now(),
        true, true, false)
ON CONFLICT DO NOTHING;

-- Teszt felhasználó beszúrása (email alapján)
INSERT INTO users (name, email, password, role, is_active, registration_date,
                   email_notifications_enabled, push_notifications_enabled, is_2fa_enabled)
VALUES ('test', '96nucu@gmail.com', '$2a$10$YNBGD.VXFtiLfljxbETaz.OJQ4uIcKGYBJDTa/qOYNla./EJx6SfG', 'USER', true, now(),
        true, true, false)
ON CONFLICT DO NOTHING;

-- Másik teszt felhasználó fix ID-val (ha szükséges)
INSERT INTO users (id, name, email, password, role, is_active, registration_date,
                   email_notifications_enabled, push_notifications_enabled, is_2fa_enabled)
VALUES (9999, 'tesztfelhasználó', 'teszt@example.com', 'hashed_password', 'USER', true, now(),
        true, true, false)
ON CONFLICT DO NOTHING;
