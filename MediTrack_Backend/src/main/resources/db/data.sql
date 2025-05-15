


INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('Admin', 'admin@meditrack.hu', 'adminpass', 'ADMIN', true, now())
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name, email, password, role, is_active, registration_date)
VALUES ('test', 'test@test.hu', '$2a$10$YNBGD.VXFtiLfljxbETaz.OJQ4uIcKGYBJDTa/qOYNla./EJx6SfG', 'USER', true, now())
ON CONFLICT (name) DO NOTHING;
