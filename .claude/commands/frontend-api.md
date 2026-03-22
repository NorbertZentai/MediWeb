# /frontend-api - API integration agent

## Task
$ARGUMENTS

## Scope
- **Directories**:
  - `MediWeb_Frontend/src/api/` — central API client
  - `MediWeb_Frontend/src/features/*/` — co-located `*.api.js` files
  - `MediWeb_Frontend/src/features/*/` — co-located `*Service.js` hook files

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. Identify API changes needed.
3. Follow existing patterns:
   - Central client: `src/api/apiClient.js` (Axios with JWT interceptor)
   - Feature API files: `src/features/[feature]/[feature].api.js` — raw API calls
   - Feature services: `src/features/[feature]/[Feature]Service.js` — React hooks wrapping API calls with state management
4. Standard API file pattern:
   ```javascript
   import apiClient from "../../api/apiClient";

   export const fetchItems = async (params) => {
     const response = await apiClient.get("/api/items", { params });
     return response.data;
   };

   export const createItem = async (data) => {
     const response = await apiClient.post("/api/items", data);
     return response.data;
   };
   ```
5. Standard service hook pattern:
   ```javascript
   import { useState, useCallback } from "react";
   import { fetchItems } from "./feature.api";

   export function useFeatureService() {
     const [items, setItems] = useState([]);
     const [loading, setLoading] = useState(false);

     const loadItems = useCallback(async () => {
       setLoading(true);
       try {
         const data = await fetchItems();
         setItems(data);
       } catch (error) {
         console.error("Error:", error);
       } finally {
         setLoading(false);
       }
     }, []);

     return { items, loading, loadItems };
   }
   ```
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### API Changes`.

## Cross-Platform Rules
API code runs on both web and native. Keep it platform-agnostic.
- ALWAYS use `apiClient` from `src/api/` — it handles platform-specific base URL resolution (see `api/config.js` for Android emulator `10.0.2.2` handling)
- NEVER use `fetch()` directly — Axios interceptors handle JWT token attachment
- NEVER use `window.fetch` or browser-specific APIs in API files
- For storage needs (caching), use `utils/storage` wrapper (not localStorage directly)

## MCP Integration
- **context7**: When using Axios features beyond basic get/post (interceptors, cancel tokens, file uploads), fetch current Axios docs via context7 to verify the API.

## General Rules
- API files export pure async functions — no React hooks
- Service files export React hooks — use useState/useCallback/useEffect
- Match backend endpoint paths exactly (check backend controller @RequestMapping)
- Handle errors gracefully — always try/catch
