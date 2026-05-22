# MediWeb — Ismert korlátok

## 1. Google Custom Search API napi kvóta
- **Korlát:** Ingyenes keretben napi 100 lekérdezés
- **Hatás:** Nagyobb adatbázis-szinkronizáció során gyorsan kimerül
- **Megoldás:** A Bing Images scraping elsődleges képforrásként működik. A Google API csak tartalékként kerül meghívásra, ha a Bing nem ad eredményt és az API kulcs be van állítva

## 2. OGYÉI és Házipatika scraping függőség
- **Korlát:** Az adatszinkronizáció nyilvános weboldalak HTML struktúrájára támaszkodik
- **Hatás:** Ha az OGYÉI vagy Házipatika megváltoztatja az oldal felépítését, a scraping leállhat
- **Megoldás:** A MedicationBatchProcessor hibakezeléssel és retry logikával rendelkezik. A már szinkronizált adatok offline is elérhetők

## 3. Bing Images scraping
- **Korlát:** Nem hivatalos API — a Bing képkeresési oldal struktúraváltozása megzavarhatja a képkeresést
- **Hatás:** Egyes gyógyszerekhez nem töltődik be kép
- **Megoldás:** Házipatika og:image meta tag használata tartalékként

## 4. Expo Push értesítések — csak natív platformon
- **Korlát:** Az Expo Push Notification Service csak natív Android/iOS alkalmazásban működik
- **Hatás:** Webes verzióban push értesítések nem érhetők el
- **Megoldás:** Email értesítések webes felhasználók számára is elérhetők

## 5. Frontend Jest snapshot teszt
- **Korlát:** A ThemedText komponens snapshot tesztje jelenleg nem fut le sikeresen, mert a tesztkörnyezetben a ThemeContext provider nincs konfigurálva
- **Hatás:** Az npx jest parancs hibával áll le
- **Megoldás:** A tesztkörnyezet provider-konfigurációjának kiegészítése fejlesztési terv

## 6. Google OAuth2 — platform-specifikus Client ID-k
- **Korlát:** A Google OAuth2 bejelentkezéshez platform-specifikus Client ID-k szükségesek (web, iOS, Android külön)
- **Hatás:** Helytelen konfiguráció esetén a Google bejelentkezés nem működik
- **Megoldás:** Email/jelszó alapú autentikáció minden platformon elérhető és működőképes

## 7. Adatbázis-szinkronizáció időtartama
- **Korlát:** A teljes OGYÉI szinkronizáció (kb. 20 000+ gyógyszer) több órát vehet igénybe
- **Hatás:** Az admin felületen az első szinkronizáció hosszú futási időt mutat
- **Megoldás:** A szinkronizáció állapota valós időben követhető a /api/medication/sync/status végponton. A folyamat bármikor leállítható és folytatható
