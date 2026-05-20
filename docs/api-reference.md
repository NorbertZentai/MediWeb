# MediWeb — REST API referencia

Alap URL (produkció): `https://mediweb-backend-qk9m.onrender.com`  
Alap URL (lokális fejlesztés): `http://localhost:8080`  
Autentikáció: `Authorization: Bearer <jwt_token>` (ahol jelölve van)

---

## Autentikáció (`/auth`)

| Metódus | Végpont | Leírás | Auth szükséges |
|---------|---------|--------|----------------|
| POST | `/auth/register` | Regisztráció (email + jelszó) | Nem |
| POST | `/auth/verify-email` | Email OTP verifikáció | Nem |
| POST | `/auth/login` | Bejelentkezés (email + jelszó, opcionálisan 2FA kóddal) | Nem |
| POST | `/auth/google` | Google OAuth2 bejelentkezés / regisztráció | Nem |
| POST | `/auth/refresh` | JWT token frissítése | Nem |
| POST | `/auth/logout` | Kijelentkezés | Igen |
| GET  | `/auth/me` | Aktuális bejelentkezett felhasználó adatai | Igen |

---

## Felhasználókezelés (`/api/users`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/users` | Összes felhasználó (admin) |
| POST | `/api/users` | Felhasználó létrehozása |
| PUT | `/api/users/username` | Felhasználónév módosítása |
| PUT | `/api/users/email` | Email módosítása |
| PUT | `/api/users/password` | Jelszó módosítása |
| PUT | `/api/users/phone` | Telefonszám módosítása |
| PUT | `/api/users/image` | Profilkép feltöltése |
| GET | `/api/users/{id}` | Felhasználó adatai ID alapján |
| DELETE | `/api/users/{id}` | Felhasználó törlése |
| PUT | `/api/users/{id}/role` | Szerepkör módosítása |
| GET | `/api/users/preferences` | Felhasználói beállítások lekérése |
| PUT | `/api/users/preferences` | Felhasználói beállítások mentése |
| POST | `/api/users/data-export` | GDPR adatexport igénylése |
| GET | `/api/users/me/export` | Saját adatok exportálása |
| DELETE | `/api/users/me` | Saját fiók törlése |
| POST | `/api/users/2fa/generate` | 2FA titkos kulcs generálása |
| POST | `/api/users/2fa/enable` | 2FA bekapcsolása |

---

## Gyógyszerek (`/api/medication`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/medication/search` | Gyógyszer keresés szűrőkkel (név, ATC kód, hatóanyag, gyártó, lapozás) |
| GET | `/api/medication/{itemId}` | Gyógyszer részletes adatlapja |
| GET | `/api/medication/sync/status` | Szinkronizáció aktuális állapota |
| POST | `/api/medication/sync/start` | Teljes szinkronizáció indítása (admin) |
| POST | `/api/medication/sync/images` | Képfrissítés indítása (admin) |
| POST | `/api/medication/sync/stop` | Szinkronizáció leállítása (admin) |

---

## Profilok és gyógyszerszedés (`/api/profiles`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/profiles` | Saját profilok listája |
| POST | `/api/profiles` | Új profil létrehozása |
| GET | `/api/profiles/{id}` | Profil adatai |
| PUT | `/api/profiles/{id}` | Profil módosítása |
| DELETE | `/api/profiles/{id}` | Profil törlése |
| GET | `/api/profiles/{profileId}/medications` | Profil gyógyszerei |
| POST | `/api/profiles/addMedication/{profileId}` | Gyógyszer hozzáadása profilhoz |
| PUT | `/api/profiles/{profileId}/medications/{medicationId}` | Gyógyszer adatainak módosítása (emlékeztető, megjegyzés) |
| DELETE | `/api/profiles/{profileId}/medications/{itemId}` | Gyógyszer eltávolítása profilból |

---

## Kedvencek (`/api/favorites`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/favorites` | Saját kedvencek listája |
| POST | `/api/favorites/{medicationId}` | Kedvencekhez adás |
| DELETE | `/api/favorites/{favoriteId}` | Kedvencekből eltávolítás |

---

## Értékelések (`/api/reviews`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/reviews/me` | Saját értékelések |
| GET | `/api/reviews/{itemId}` | Gyógyszer értékelései |
| POST | `/api/reviews/{itemId}` | Új értékelés beküldése |
| PUT | `/api/reviews/{itemId}` | Értékelés módosítása |
| POST | `/api/reviews/{reviewId}/report` | Értékelés bejelentése |

---

## Admin (`/api/admin`)

| Metódus | Végpont | Leírás |
|---------|---------|--------|
| GET | `/api/admin/dashboard` | Admin dashboard statisztikák |
| GET | `/api/admin/users` | Felhasználók listája |
| PUT | `/api/admin/users/{id}/role` | Szerepkör módosítása |
| PUT | `/api/admin/users/{id}/active` | Fiók aktív/inaktív állítása |
| DELETE | `/api/admin/users/{id}` | Felhasználó törlése |
| GET | `/api/admin/reviews` | Összes értékelés |
| PUT | `/api/admin/reviews/{id}/check` | Értékelés ellenőrzöttnek jelölése |
| DELETE | `/api/admin/reviews/{id}` | Értékelés törlése |
| GET | `/api/admin/reviews/reported` | Bejelentett értékelések |
| DELETE | `/api/admin/reviews/reports/{id}` | Bejelentés törlése |
| GET | `/api/admin/sync/config` | Szinkronizáció konfiguráció |
| PUT | `/api/admin/sync/config` | Szinkronizáció konfiguráció módosítása |
| GET | `/api/admin/sync/status` | Szinkronizáció állapot (admin nézet) |
