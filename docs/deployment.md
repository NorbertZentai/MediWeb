# MediWeb — Telepítési dokumentáció

## Architektúra áttekintés

Az alkalmazás három Docker konténerből áll, amelyek docker-compose segítségével futtathatók helyben, vagy Render.com-on önállóan. A frontend a 3000-es, a backend a 8080-as, az adatbázis az 5432-es porton fut.

---

## Helyi fejlesztői futtatás

### Előfeltételek
- Docker és Docker Compose
- Java 17 (JDK)
- Node.js 18+

### 1. Csak adatbázis (ajánlott fejlesztéshez)

**Parancs:** docker compose -f docker-compose.dev.yml up -d

Ez elindít egy PostgreSQL 15 példányt a localhost:5432 címen, a backend és frontend natívan fut.

**Backend indítása**  
**Parancs:** cd MediWeb_Backend && ./mvnw spring-boot:run

**Frontend indítása**
**Parancs:** cd MediWeb_Frontend && npm install && npm run web

### 2. Teljes stack Docker Compose-zal

A .env.example fájlt másold le .env névre és töltsd ki a szükséges értékekkel, majd futtasd:

**Parancs:** docker compose -f docker-compose.prod.yml --env-file .env up -d --build

| Szolgáltatás | Port |
|-------------|------|
| Frontend | 3000 |
| Backend | 8080 |
| PostgreSQL | 5432 |

---

## Produkciós telepítés (Render.com)

A produkciós környezet Render.com felhőszolgáltatón fut, a render.yaml konfigurációs fájl alapján. Három service fut Frankfurt régióban:

| Service | Típus | URL |
|---------|-------|-----|
| mediweb-database | PostgreSQL | — (belső) |
| mediweb-backend | Web service (Docker) | https://mediweb-backend-qk9m.onrender.com |
| mediweb-frontend | Web service (Docker) | https://mediweb-frontend-a4xk.onrender.com |

### Docker build folyamat

Backend — single-stage build: Eclipse Temurin 17 JDK alap image, mvn clean package -DskipTests paranccsal JAR csomagolás, majd java -jar target/*.jar indítással fut.

Frontend — multi-stage build: Builder stage Node 18 alapon, npm ci és npx expo export --platform web parancsokkal, Runner stage-ben serve statikus szerver a dist/ mappából.

### Környezeti változók (Render.com-on beállítandó)

Az egyes szolgáltatásokhoz tartozó változók részletes leírása az external-services.md fájlban található.

| Változó | Leírás |
|---------|--------|
| SPRING_DATASOURCE_URL | Automatikusan kitöltődik a mediweb-database service-ből |
| SPRING_DATASOURCE_USERNAME | Automatikusan kitöltődik |
| SPRING_DATASOURCE_PASSWORD | Automatikusan kitöltődik |
| SPRING_PROFILES_ACTIVE | prod |
| GOOGLE_API_KEY | Google Custom Search API kulcs (opcionális) |
| GOOGLE_CX | Custom Search Engine ID (opcionális) |
| MAIL_USERNAME | SMTP email cím |
| MAIL_PASSWORD | SMTP App Password |
| JWT_SECRET | JWT aláíró kulcs (min. 64 karakter) |
| GOOGLE_CLIENT_ID | Google OAuth2 Client ID |

### Újratelepítés

A master branch pusholásakor a Render.com automatikusan újraépíti és újraindítja a service-eket. Manuális újraindítás a Render Dashboard-ról is kezdeményezhető.

---

## Hasznos parancsok

- Logok követése: docker compose logs -f backend
- Konténerek leállítása: docker compose down
- Leállítás és adatok törlése: docker compose down -v
- Csak backend újraépítése: docker compose up -d --build backend
