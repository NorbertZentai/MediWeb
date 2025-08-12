# Render.com Environment Variables Setup

## Lépések a Render Dashboard-on:

1. Menj a Render Dashboard-ra: https://dashboard.render.com/
2. Válaszd ki a "mediweb-backend" service-t
3. Kattints az "Environment" tabra
4. Add hozzá ezeket a változókat:

### Változók hozzáadása:

```
GOOGLE_API_KEY = REDACTED_GOOGLE_API_KEY
GOOGLE_SEARCH_ENGINE_ID = REDACTED_GOOGLE_CX
```

### Lépések:
1. "Add Environment Variable" gombra kattints
2. Key: `GOOGLE_API_KEY`
3. Value: `REDACTED_GOOGLE_API_KEY`
4. "Add Environment Variable" gombra kattints újra
5. Key: `GOOGLE_SEARCH_ENGINE_ID`  
6. Value: `REDACTED_GOOGLE_CX`
7. "Save Changes" gombra kattints

### Automatikus újradeployment:
A környezeti változók módosítása után a service automatikusan újraindul.

## Ellenőrzés:
Az újraindítás után a backend log-ban látni fogod:
```
🔍 [GOOGLE-IMG] Searching images for: ALGOFLEX BABY 20 mg/ml belsőleges szuszpenzió
✅ [GOOGLE-IMG] Successfully found images for: ALGOFLEX BABY 20 mg/ml belsőleges szuszpenzió
```

## Tesztelés:
Miután beállítottad, próbáld ki újra a gyógyszer oldalt: https://mediweb-frontend.onrender.com/medication/35756
