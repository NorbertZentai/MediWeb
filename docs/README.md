# MediWeb — Elektronikus Melléklet

**Zentai Norbert | G1B6L5 | Programtervező informatikus BSc**
Szegedi Tudományegyetem, Informatikai Intézet, 2026

---

## Élő alkalmazás

| Szolgáltatás | URL |
|-------------|-----|
| Frontend (webes felület) | https://mediweb-frontend-a4xk.onrender.com |
| Backend (REST API) | https://mediweb-backend-qk9m.onrender.com |

---

## Forráskód

| Adat | Érték |
|------|-------|
| GitHub repozitórium | https://github.com/NorbertZentai/MediWeb |
| Végleges branch | master |
| Végleges commit | f9e8c2c489b1f5997db9638bcf3a5f241e10fb56 |

---

## A melléklet tartalma

### docs/
| Fájl | Tartalom |
|------|----------|
| api-reference.md | Teljes REST API végpontlista (7 végpontcsoport, ~50 végpont) |
| external-services.md | Külső szolgáltatások leírása (OGYÉI, Google, Expo, SMTP) |
| known-limitations.md | Ismert korlátok és megkerülő megoldások |
| security-minimum.md | Biztonsági minimum ellenőrzőlista (XSS, SQL injection, auth, RBAC) |
| deployment.md | Telepítési dokumentáció (helyi futtatás, Docker, Render.com) |

### docs/abrak/
A szakdolgozatban szereplő összes folyamatábra és architektúra diagram:

| Fájl | Tartalom |
|------|----------|
| 3.1_Fo_Architektura.png | Rendszer architektúra rétegdiagram (3.1. Ábra) |
| 4.2_Adatmodell_ERD.png | Adatbázis adatmodell / ERD (4.2. Ábra) |
| 5.5_Autentikacios_folyamatabra.png | Autentikációs folyamatábra (5.5. Ábra) |
| 5.6_Gyogyszerkeresesi_folyamatabra.png | Gyógyszerkeresési folyamatábra (5.6. fejezet) |
| 5.7_Email_Verifikacio_folyamatabra.png | Email verifikációs folyamatábra (5.7. Ábra) |
| 5.8_Ertesitesi_folyamatabra.png | Értesítési rendszer folyamatábra (5.8. Ábra) |
| 5.9_Szinkronizacios_folyamatabra.png | Szinkronizációs folyamatábra (5.9. Ábra) |

### docs/screenshots/
Az alkalmazás összes képernyőképe, fejezetszám szerint elnevezve:

| Fájlnév-prefix | Képernyő |
|----------------|----------|
| 3.3_* | Regisztráció, bejelentkezés, email megerősítés |
| 3.4_* | Főoldal (bejelentkezve / vendégként) |
| 3.5_* | Gyógyszer keresés (szűrőkkel, találatokkal) |
| 3.6_* | Gyógyszer részletező oldal |
| 3.7_* | Felhasználói profil szerkesztés |
| 3.8_* | Profilok kezelése (családtagok) |
| 3.9_* | Gyógyszerszedési ütemezés |
| 3.10_* | Kedvencek, legutóbbi megtekintések |
| 3.11_* | Gyógyszer értékelések |
| 3.12_* | Beviteli statisztikák |
| 3.13_* | Beállítások |
| 3.14_* | Admin felület (felhasználók, értékelések, szinkronizáció) |
| 3.15_* | Mobil nézet (Android/iOS) |

### .env.example
Szükséges környezeti változók sablonfájlja — valós értékek nélkül. (Repo gyökerében található.)

---

## Futtatás

A helyi futtatás lépései (adatbázis, backend, frontend) és a produkciós telepítés részletei a docs/deployment.md fájlban találhatók. A szükséges környezeti változók sablonját a .env.example tartalmazza.
