# Mobil Optimalizálási Terv (Android & iOS)

Ez a dokumentum részletezi a MediWeb projekt mobil platformokra (Android és iOS) történő optimalizálásának lépéseit. Jelenleg a projekt főként webes környezetre van felkészítve, bár React Native-et használ.

## 1. Navigáció és Routing Migráció ✅ DONE
A jelenlegi `react-router-dom` megoldás nem támogatott natív mobilon.
- **Feladat:** Áttérés `expo-router`-re (ajánlott) vagy `@react-navigation/native`-re.
- **Lépések:**
  - ✅ `AppRouter.js` átalakítása Stack/Tabs alapú navigációra.
  - ✅ Webes `useNavigate` és `Link` komponensek cseréje az Expo/React Navigation megfelelőire.
  - ✅ Deep linking beállítása (`mediweb://`).

## 2. Adattárolás és Autentikáció ✅ DONE
A `localStorage` csak böngészőben működik.
- **Feladat:** Helyettesítés `@react-native-async-storage/async-storage`-al.
- **Lépések:**
  - ✅ `AuthContext.js` és `api/config.js` frissítése, hogy `AsyncStorage`-et használjon az `authToken` tárolására.
  - ✅ Platform-specifikus helper készítése, amely weben `localStorage`-et, mobilon `AsyncStorage`-et hív meg.

## 3. Megjelenés és Reszponzivitás (UI/UX) ✅ DONE
A jelenlegi layout (pl. oldalsáv, 70%-os szélesség) nem ideális kis kijelzőkre.
- **Feladat:** Rugalmas elrendezés és mobil-specifikus stílusok.
- **Lépések:**
  - ✅ **Grid System:** A `HomeScreen`-en és `SearchScreen`-en mobil nézetben stack layout alkalmazása (1 oszlop).
  - ✅ **Mértékegységek:** `useResponsiveLayout` hook készítése a dinamikus méretezéshez.
  - ✅ **Oldal elrendezés:** A tartalom szűkítése (max-width) mobilon 100%-ra vált.

## 4. Toast Üzenetek és Értesítések ✅ DONE
A `react-toastify` nem működik natív mobilon.
- **Feladat:** Olyan megoldás keresése, ami weben és mobilon is szép.
- **Lépések:**
  - ✅ **Unified Toast Utility:** `src/utils/toast.js` létrehozása, ami weben a `react-toastify`-t, mobilon a `react-native-toast-message`-t hívja.
  - ✅ **Provider:** `ToastProvider` frissítése.
  - ✅ **Refactoring:** Minden `import { toast } from 'react-toastify'` cseréje `utils/toast`-ra.
  - ✅ **Push Notifications:** `expo-notifications` implementálva, alap konfiguráció kész.

## 5. Konfiguráció és Build Beállítások ✅ DONE
- **Feladat:** App Store és Play Store kész állapot.
- **Lépések:**
  - ✅ **App.json:** Ikonok, splash screen, bundle identifier (`com.mediweb.mobile`), verziószám ellenőrzése.
  - ✅ **Permissions:** Értesítések engedély kérése startoláskor. (Egyéb engedély nem szükséges).

## 6. Teljesítmény és Natív Funkciók ✅ DONE
- **Feladat:** "App-érzet" növelése.
- **Lépések:**
  - ✅ **Haptics:** Rezgés a gombokhoz (keresés, szűrők, navigáció) az `expo-haptics` segítségével. Wrapper: `utils/haptics.js`.
  - **Betűtípusok:** `expo-font` már használva van a layoutban.

## Prioritási Sorrend
1. **P0 (Kritikus):** Navigáció (Routing) javítása és `AsyncStorage` bevezetése.
2. **P1 (UI):** Layout reszponzivitás és CSS fixek.
3. **P2 (Feature)::** Toast-ok cseréje és ikonok beállítása.
4. **P3 (Extra):** Push értesítések és haptics.
