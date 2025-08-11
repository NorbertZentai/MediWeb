# MediWeb

Egészségügyi gyógyszerszedési szokások (saját és családi) követésére készült webes alkalmazás. A projekt egy monorepo: Spring Boot alapú backend és Expo/React Native (web) frontend, Postgres adatbázissal.

## Könyvtárstruktúra

- `MediWeb_Backend/` – Spring Boot 3 (Java 17, Maven Wrapper), PostgreSQL
- `MediWeb_Frontend/` – Expo + React Native Web (Node.js, npm)
- `docker-compose.dev.yml` – fejlesztői környezet (csak DB)
- `docker-compose.prod.yml` – produkciós stack (DB + backend + frontend)
- `.env` – produkciós compose-hoz szükséges környezeti változók

## Követelmények

- Java 17 (JDK)
- Docker és Docker Compose
- Node.js 18+ és npm
- macOS/zsh parancsok a példákban

## Környezeti változók (.env)

A `docker-compose.prod.yml` ezeket várja a gyökérben lévő `.env` fájlban:

```
POSTGRES_DB=mediweb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mediweb
GOOGLE_API_KEY=<sajat_google_api_kulcs>
GOOGLE_CX=<sajat_google_cx>
```

Megjegyzés: fejlesztői módban a frontend a `http://localhost:8080` címre hív (lásd `MediWeb_Frontend/src/api/config.js`).

## Fejlesztői futtatás (ajánlott)

1) Adatbázis (Docker):

```
docker compose -f docker-compose.dev.yml up -d
```

2) Backend (Spring Boot, dev profil):

```
./MediWeb_Backend/mvnw spring-boot:run
```

Alapértelmezett port: 8080

3) Frontend (Expo Web):

```
cd MediWeb_Frontend
npm install
npm run web
```

Alapértelmezett port: 3000

## Produkciós futtatás (Docker Compose)

1) Töltsd ki a `.env` fájlt (lásd fent).

2) Indítás és build:

```
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

- DB: 5432
- Backend: 8080
- Frontend (web): 3000

## Tesztek

- Backend:

```
./MediWeb_Backend/mvnw test
```

- Frontend (Jest + jest-expo):

```
cd MediWeb_Frontend
npx jest
```

## Hasznos parancsok

- Docker logok: `docker compose logs -f`
- Konténerek leállítása: `docker compose down`
- Expo cache törlése: `npm start` (Expo) vagy `npx expo start --web --port 3000 -c`

## Hibaelhárítás

- Portütközés (3000/8080/5432): állíts le más folyamatot vagy módosíts portot.
- Frontend nem éri el a backendet: ellenőrizd, hogy a backend a 8080-as porton fut-e, és a `MediWeb_Frontend/src/api/config.js` `baseURL` megfelelő-e.
- Maven/JDK gond: ellenőrizd a JDK 17 telepítést és futtasd a wrapperrel: `./mvnw`.

## Funkcionalitás

- Regisztráció, bejelentkezés és jogosultságkezelés (Spring Security)
- Gyógyszerek és leírások keresése (Google Custom Search API + web scraping jsoup-pal)
- Gyógyszerszedési ütemezés, emlékeztetők és statisztikák (React Native Chart Kit)
- Web push és e-mail értesítések (web-push, Spring Mail)
- Profilkezelés, alapvető beállítások, keresés és értékelések modulok

## Architektúra áttekintés

- Backend: Spring Boot 3 (Java 17, Maven), JPA, WebFlux, PostgreSQL
- Frontend: Expo + React Native Web, React Navigation, Expo Router
- Adatbázis: PostgreSQL 15
- Alap portok: API 8080, Web 3000, DB 5432

```
[Frontend] —3000→ [Backend/API] —8080→ [PostgreSQL] —5432→ [Volume]
```

## Backend futtatás és konfiguráció

- Dev profil: `SPRING_PROFILES_ACTIVE=dev` (alapértelmezett a helyi futtatáshoz)
- Helyi JDBC példa, ha a DB a gépen fut: `jdbc:postgresql://localhost:5432/mediweb`
- Dockeres DB esetén (dev compose): `localhost:5432`, user: `postgres`, pass: `postgres`
- Build:
  - Tesztek: `./MediWeb_Backend/mvnw test`
  - Csomagolás: `./MediWeb_Backend/mvnw clean package`
  - Futás JAR-ból: `java -jar MediWeb_Backend/target/MediWeb-0.0.1-SNAPSHOT.jar`

Megjegyzés: a konfigurációs fájlok nevei `application-*.yml` legyenek. Ha elgépelés (pl. `applicaition.yml`) van, javítani szükséges.

## Frontend futtatás és tippek

- Telepítés és futtatás (web):
  - `cd MediWeb_Frontend && npm install`
  - `npm run web` (vagy `npm start` cache törléssel)
- API elérési alap: `http://localhost:8080` (lásd `src/api/config.js`)
- Tesztek: `npx jest`

## Build és release (áttekintés)

- Backend: Docker image a `MediWeb_Backend/Dockerfile` alapján vagy JAR
- Frontend: jelenleg a compose a fejlesztői szervert indítja. Production buildhez érdemes statikus web buildet készíteni (pl. `npx expo export --platform web`) és egy statikus szerverrel kiszolgálni.

## Docker tippek

- Fejlesztői DB: `docker compose -f docker-compose.dev.yml up -d`
- Teljes stack (prod): `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
- Logok: `docker compose logs -f`
- Leállítás: `docker compose down`
- Volumek törlése (óvatosan): `docker compose down -v`

## Biztonság és titokkezelés

- A `.env` fájlban érzékeny adatok vannak (DB jelszó, Google kulcsok). Ezt ne committold nyilvános repo-ba.
- Követelmény a `GOOGLE_API_KEY` és `GOOGLE_CX` beállítása a keresési funkciókhoz.

## Közreműködés

- Branch stratégia: `master` stabil, fejlesztéshez külön feature branchek
- Commit üzenetek: tömörek, leírók; PR-ben rövid összefoglaló és tesztelési lépések
- Issue-k: hibajegy vagy feature kérés létrehozása reprodukcióval/elfogadási kritériumokkal

## Licenc

TBD
