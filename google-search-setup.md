# Google Custom Search API Setup Guide

## 1. Google Cloud Console beállítás

1. Menj a Google Cloud Console-ra: https://console.cloud.google.com/
2. Válaszd ki a projekted vagy hozz létre újat
3. Engedélyezd a "Custom Search API"-t:
   - APIs & Services > Library
   - Keress rá: "Custom Search API"
   - Kattints "Enable"

## 2. API Key létrehozása

1. APIs & Services > Credentials
2. "Create Credentials" > "API Key"
3. Másold ki a generált API key-t
4. (Opcionális) Korlátozd az API key-t csak Custom Search API-ra

## 3. Custom Search Engine létrehozása

1. Menj ide: https://programmablesearchengine.google.com/
2. "Get started" > "Add"
3. Konfiguráció:
   - **Sites to search**: `*` (teljes web keresés)
   - **Name**: "MediWeb Image Search"
   - **Language**: Hungarian
4. Kattints "Create"
5. A létrehozott search engine-ben:
   - "Control Panel" > "Setup"
   - **Image search**: ON
   - **Search the entire web**: ON
6. Másold ki a **Search engine ID**-t

## 4. Environment változók beállítása (Render.com)

A Render Dashboard-on add hozzá ezeket az environment változókat:

```
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## 5. Lokális fejlesztéshez (.env fájl)

A backend gyökerében hozz létre egy `.env` fájlt:

```
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

## 6. Költségek

- Google Custom Search API: 100 keresés/nap ingyenes
- Utána: $5 per 1000 kérés
- Havi limit beállítható a Cloud Console-ban

## 7. Tesztelés

Miután beállítottad a változókat, a backend újraindul és a képkeresés automatikusan működni fog.
