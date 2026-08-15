# MediWeb

Egészségügyi gyógyszerszedési szokások (saját és családi) követésére készült webes és natív mobil alkalmazás. A projekt egy monorepo: Spring Boot alapú backend és Expo/React Native (web + Android/iOS) frontend, PostgreSQL adatbázissal.

## Dokumentáció

| Fájl | Tartalom |
|------|----------|
| [docs/api-reference.md](docs/api-reference.md) | Teljes REST API végpontlista |
| [docs/external-services.md](docs/external-services.md) | Külső szolgáltatások és API-k leírása |
| [docs/known-limitations.md](docs/known-limitations.md) | Ismert korlátok és megkerülő megoldások |
| [.env.example](.env.example) | Szükséges környezeti változók listája |

## Könyvtárstruktúra

- `MediWeb_Backend/` – Spring Boot 3.4.1 (Java 17, Maven Wrapper), PostgreSQL
- `MediWeb_Frontend/` – Expo SDK 54 + React Native Web (Node.js, npm)
- `docker-compose.dev.yml` – fejlesztői környezet (csak DB)
- `docker-compose.prod.yml` – produkciós stack (DB + backend + frontend)
- `.env.example` – szükséges környezeti változók sablonfájlja
- `MediWeb_Backend/src/main/resources/db/` – adatbázis séma (`schema.sql`), kezdőadatok (`data.sql`) és migrációs script
- `docs/` – részletes technikai dokumentáció

## Követelmények

- Java 17 (JDK)
- Docker és Docker Compose
- Node.js 18+ és npm
- (Opcionális) Expo Go alkalmazás Android/iOS teszteléshez

## Környezeti változók

Másold le az `.env.example` fájlt `.env` névvel és töltsd ki az értékeket:

```
cp .env.example .env
```

Az összes szükséges változó leírása az [.env.example](.env.example) fájlban található.

## Fejlesztői futtatás (ajánlott)

**1. Adatbázis indítása (Docker):**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**2. Backend indítása (Spring Boot, dev profil):**

```bash
./MediWeb_Backend/mvnw spring-boot:run
```

Alapértelmezett port: `8080`

**3. Frontend indítása (Expo Web):**

```bash
cd MediWeb_Frontend
npm install
npm run web
```

Alapértelmezett port: `3000`

## Produkciós futtatás (Docker Compose)

1. Töltsd ki a `.env` fájlt (lásd `.env.example`).

2. Indítás és build:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Portok: DB `5432`, Backend `8080`, Frontend `3000`

## Tesztek

**Backend:**

```bash
./MediWeb_Backend/mvnw test
```

**Frontend (Jest + jest-expo):**

```bash
cd MediWeb_Frontend
npx jest
```

> Megjegyzés: a `ThemedText` snapshot teszt jelenleg nem fut le sikeresen — a tesztkörnyezet ThemeContext provider-konfigurációja kiegészítésre szorul.

## Funkcionalitás

- **Autentikáció:** Regisztráció email + jelszóval, OTP email-verifikáció, bejelentkezés, Google OAuth2, kétfaktoros hitelesítés (TOTP/2FA), JWT tokenfrissítés
- **Gyógyszer-adatbázis:** OGYÉI szinkronizáció (web scraping), Házipatika adatok, képkeresés (Bing Images scraping elsődlegesen, Google Custom Search API opcionálisan)
- **Gyógyszerkezelés:** Keresés és szűrés, részletes adatlap, kedvencek, profil alapú gyógyszerszedési ütemezés
- **Profil rendszer:** Több profil (pl. családtagok), gyógyszerszedési napló, adherencia statisztikák
- **Értékelések:** 1–5 csillagos értékelések, moderáció, bejelentési rendszer
- **Értesítések:** Email emlékeztetők (Spring Mail + SMTP), push értesítések natív eszközökre (Expo Push Service)
- **Admin felület:** Felhasználókezelés, értékelés moderáció, szinkronizáció indítása/leállítása valós idejű állapotkövetéssel
- **Offline támogatás:** Natív alkalmazásban az utoljára megtekintett gyógyszerek offline is elérhetők (AsyncStorage cache)
- **Reszponzív:** Web (asztali + mobil böngésző) és natív Android/iOS egységes kódbázisból

## Architektúra

```
[Expo/React Native Web]  ──────►  [Spring Boot REST API]  ──────►  [PostgreSQL 15]
      port 3000                          port 8080                     port 5432
```

- **Backend:** Spring Boot 3.4.1, Spring Security (JWT), Spring Data JPA, Spring Mail, WebFlux
- **Frontend:** Expo SDK 54, React Native Web, Expo Router, Axios
- **Adatbázis:** PostgreSQL 15, séma: `MediWeb_Backend/src/main/resources/db/schema.sql` + migrációs scriptek

## Backend konfiguráció

- Dev profil: `SPRING_PROFILES_ACTIVE=dev` (alapértelmezett helyi futtatáshoz)
- Helyi DB JDBC URL: `jdbc:postgresql://localhost:5432/mediweb`
- Dockeres dev DB esetén ugyanez a cím, user: `postgres`, pass: `postgres`

Build parancsok:

```bash
./MediWeb_Backend/mvnw test                  # tesztek futtatása
./MediWeb_Backend/mvnw clean package         # JAR csomagolás
java -jar MediWeb_Backend/target/MediWeb-0.0.1-SNAPSHOT.jar  # futtatás JAR-ból
```

## Frontend konfiguráció

- API alap URL: `http://localhost:8080` (lásd `src/api/config.js`)
- Web build: `npx expo export --platform web`
- Natív futtatás Expo Go-val: `npx expo start` → QR kód beolvasása

## Docker tippek

```bash
docker compose -f docker-compose.dev.yml up -d          # fejlesztői DB indítása
docker compose -f docker-compose.prod.yml --env-file .env up -d --build  # teljes stack
docker compose logs -f                                  # logok követése
docker compose down                                     # leállítás
docker compose down -v                                  # leállítás + volume törlés (óvatosan)
```

## Hibaelhárítás

- **Portütközés** (3000/8080/5432): állíts le más folyamatot vagy módosíts portot
- **Frontend nem éri el a backendet:** ellenőrizd a `MediWeb_Frontend/src/api/config.js` `baseURL` értékét
- **Maven/JDK hiba:** ellenőrizd a JDK 17 telepítést (`java -version`), és mindig a wrapperrel futtasd: `./mvnw`
- **Google bejelentkezés nem működik:** ellenőrizd a `GOOGLE_CLIENT_ID` és `EXPO_PUBLIC_GOOGLE_CLIENT_ID` env változókat
- **Email nem megy ki:** ellenőrizd az SMTP beállításokat; Gmail esetén App Password szükséges (nem a fiók jelszava)

## Biztonság

- A `.env` fájl érzékeny adatokat tartalmaz (a `.gitignore` már tartalmazza)
- A Google Custom Search API (`GOOGLE_API_KEY`, `GOOGLE_CX`) **opcionális** — nélküle az alkalmazás teljesen működőképes, a Bing Images scraping veszi át a képkeresést
- Produkciós SMTP konfiguráció esetén az OTP kódok kizárólag emailen kerülnek kézbesítésre

## Licenc

TBD
