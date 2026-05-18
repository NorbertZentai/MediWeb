# MediWeb — Külső szolgáltatások és API-k

## Kötelező szolgáltatások

### 1. PostgreSQL 15
- **Szerepe:** Elsődleges adatbázis
- **Helyi futtatáshoz:** Docker Compose (`docker-compose.dev.yml`)
- **Produkciós környezetben:** Render.com felhőszolgáltatón futó dedikált PostgreSQL adatbázis
- **Kapcsolódó env változók:** `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `SPRING_DATASOURCE_URL`

### 2. OGYÉI (Országos Gyógyszerészeti és Élelmezés-egészségügyi Intézet)
- **URL:** https://www.ogyei.gov.hu/
- **Szerepe:** Gyógyszer-adatbázis forrása — szinkronizáció alapja
- **Hozzáférés:** Nyilvános weboldal, Jsoup web scraping
- **Kapcsolódó osztályok:** `OgyeiRequestHelper`, `MedicationParser`, `MedicationBatchProcessor`
- **Megjegyzés:** Nem hivatalos API, HTML scraping — az oldal struktúraváltozása megzavarhatja a szinkronizációt

### 3. Házipatika (hazipatika.com)
- **URL:** https://www.hazipatika.com/
- **Szerepe:** Kiegészítő gyógyszer-információk és képek (og:image meta tag)
- **Hozzáférés:** Nyilvános weboldal, Jsoup web scraping
- **Kapcsolódó osztályok:** `HazipatikaSearchService`

---

## Opcionális szolgáltatások

### 4. Google Custom Search API
- **URL:** https://developers.google.com/custom-search/v1/overview
- **Szerepe:** Gyógyszerkép keresés másodlagos forrása (Bing scraping után)
- **Korlát:** Ingyenes keretben **napi 100 lekérdezés**
- **Szükséges:** API kulcs + Custom Search Engine ID
- **Kapcsolódó env változók:** `GOOGLE_API_KEY`, `GOOGLE_CX`
- **Kapcsolódó osztályok:** `GoogleImageService`
- **Megjegyzés:** Az alkalmazás enélkül is teljesen működik — a Bing Images scraping az elsődleges képforrás

### 5. Bing Images (scraping)
- **URL:** https://www.bing.com/images
- **Szerepe:** Gyógyszerkép keresés elsődleges forrása
- **Hozzáférés:** Nyilvános weboldal, Jsoup web scraping
- **Kapcsolódó osztályok:** `WebImageSearchService`
- **Megjegyzés:** Nem hivatalos API — a Bing esetleges struktúraváltozása hatással lehet rá

### 6. Google OAuth2 / Google Identity Services
- **URL:** https://developers.google.com/identity/gsi/web
- **Szerepe:** Alternatív bejelentkezési lehetőség Google fiókkal
- **Szükséges:** Google Cloud Console → OAuth2 Client ID (Web, iOS, Android)
- **Kapcsolódó env változók:** `GOOGLE_CLIENT_ID` (backend), `EXPO_PUBLIC_GOOGLE_CLIENT_ID` stb. (frontend)
- **Kapcsolódó osztályok:** `AuthService.verifyGoogleToken`
- **Megjegyzés:** Nélküle a Google bejelentkezés nem működik, de az email/jelszó alapú autentikáció igen

### 7. Expo Push Notification Service
- **URL:** https://exp.host/--/api/v2/push/send
- **Szerepe:** Mobil push értesítések kézbesítése Android/iOS eszközökre
- **Hozzáférés:** Ingyenes, regisztráció nem szükséges — az Expo SDK automatikusan kezeli
- **Kapcsolódó osztályok:** `PushNotificationService`, `ExpoPushToken`
- **Megjegyzés:** Csak natív Expo alkalmazásban működik, webes verzióban nem

### 8. SMTP (email küldés)
- **Szerepe:** OTP verifikációs emailek és gyógyszerszedési emlékeztetők küldése
- **Konfiguráció:** Bármely SMTP szerver (tesztelve: Gmail App Password)
- **Kapcsolódó env változók:** `MAIL_USERNAME`, `MAIL_PASSWORD`
- **Kapcsolódó osztályok:** `EmailNotificationService`
- **Megjegyzés:** Fejlesztői módban, ha nincs SMTP konfigurálva, az OTP kód a szerver konzolnaplójában jelenik meg
