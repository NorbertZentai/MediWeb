# MediWeb — Biztonsági minimum ellenőrzés

## Ellenőrző lista

| Terület | Ellenőrzés | Megvalósítás |
|---------|------------|--------------|
| XSS | Felhasználói input megjelenítése biztonságos-e | React Native natív komponenseket renderel, nem HTML-t — XSS nem releváns; backend oldalán Spring Data JPA paraméteres lekérdezések |
| SQL injection | Adatbázis-lekérdezések paraméterezettsége | Spring Data JPA + Hibernate ORM — minden lekérdezés paraméteres, nincs nyers SQL string összefűzés |
| Titkos adatok | Nincs érzékeny adat a repóban | .env fájl gitignorált; .env.example csak placeholder értékeket tartalmaz; Google API kulcs eltávolítva a git history-ból |
| Autentikáció | Azonosítás megvalósítása | JWT-alapú, állapotmentes autentikáció — JwtAuthenticationFilter minden kérést ellenőriz a Spring Security szűrőláncban |
| Jelszótárolás | Jelszavak hash-elése | BCryptPasswordEncoder — a jelszavak soha nem kerülnek nyers formában tárolásra |
| Autorizáció | Végpontok jogosultságvédelme | RBAC: az admin végpontok csak ADMIN szerepkörrel, a felhasználói végpontok USER vagy ADMIN szerepkörrel érhetők el |
| CSRF | Cross-Site Request Forgery védelem | JWT token alapú autentikáció esetén CSRF védelem nem szükséges — a SecurityConfig-ban tudatosan le van tiltva |

---

## Megjegyzések

**Autentikáció és autorizáció részletei**

A bejelentkezés során a backend JJWT könyvtárral állít ki tokent, amelyet a kliens Authorization: Bearer fejlécként csatol minden kéréshez. A JwtAuthenticationFilter a Spring Security szűrőlánc elején ellenőrzi a token érvényességét. A jogosultságkezelés szerepkör alapú: a USER és ADMIN szerepkörök elkülönülnek, az admin funkciók (felhasználókezelés, szinkronizáció indítása) kizárólag ADMIN szerepkörrel érhetők el.

**Titkos adatok kezelése**

A fejlesztés során egy Google API kulcs véletlenül bekerült a git history-ba. Ezt git filter-repo segítségével eltávolítottuk az összes commitból, a kulcsot a Google Cloud Console-ban visszavontuk és újat generáltunk.
