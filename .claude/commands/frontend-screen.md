# /frontend-screen - Screen/Feature component agent

## Task
$ARGUMENTS

## Scope
- **Directory**: `MediWeb_Frontend/src/features/*/`
- **File patterns**: `*Screen.js`, `*Modal.js`, `*Section.js`

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. Identify which screen(s) to create or modify.
3. Follow existing patterns:
   - Feature-based organization: `src/features/[feature]/`
   - Screen component: `[Feature]Screen.js`
   - Co-located styles: `[Feature]Screen.style.js` with `createStyles(theme)` pattern
   - Co-located API: `[feature].api.js`
   - Co-located service hook: `[Feature]Service.js` (custom hook with `use` prefix)
4. Standard screen structure:
   ```javascript
   import React, { useState, useEffect, useMemo } from "react";
   import { View, Text, ... } from "react-native";
   import { useRouter } from "expo-router";
   import { useTheme } from "contexts/ThemeContext";
   import { createStyles } from "./FeatureScreen.style";

   export default function FeatureScreen() {
     const router = useRouter();
     const { theme } = useTheme();
     const styles = useMemo(() => createStyles(theme), [theme]);
     // ...
   }
   ```
5. For styles, follow pattern:
   ```javascript
   import { StyleSheet } from "react-native";
   export const createStyles = (theme) => StyleSheet.create({
     container: { flex: 1, backgroundColor: theme.colors.background },
     // ...
   });
   ```
6. Handle platform differences:
   - Use `.native.js` / `.web.js` suffixes for platform-specific implementations
   - Or use `Platform.select()` / `Platform.OS === 'web'` for inline differences
7. Apply changes using the Edit tool.
8. Update `.claude/pipeline-state.md` under `### Screen Changes`.

## Allowed Imports
- `contexts/*` (AuthContext, ThemeContext)
- `components/*` (shared components)
- `utils/*` (toast, haptics, storage, notifications)
- `hooks/*` (custom hooks)
- `./[feature].api` (co-located API)
- `assets/*` (images, fonts)
- NEVER import directly from another feature's internal files

## Cross-Platform Rules (CRITICAL)
Every change MUST work on both web AND native unless explicitly scoped to one platform.

### MUST DO
- Use `utils/toast` wrapper — NEVER import `react-toastify` or `react-native-toast-message` directly
- Use `utils/haptics` wrapper — NEVER import `expo-haptics` directly
- Use `utils/storage` wrapper — NEVER use `localStorage` or `AsyncStorage` directly
- For confirmation dialogs: `Platform.OS === 'web' ? window.confirm() : Alert.alert()`
- For shadows in styles: `Platform.select({ web: { boxShadow: '...' }, default: { shadowColor: '...' } })`
- For file input (web): guard with `Platform.OS === 'web'` before using `document.createElement`

### MUST NOT
- NEVER use `window.*`, `document.*`, `navigator.*` without `Platform.OS === 'web'` guard
- NEVER use `Alert.alert()` without web fallback (it silently fails on web)
- NEVER import platform-specific libraries in universal files (put them in `.web.js`/`.native.js`)
- NEVER assume touch events work the same on web (hover states differ)

### Platform-Specific Code Pattern
```javascript
// PREFERRED: inline platform check
if (Platform.OS === 'web') {
  // web-specific code
} else {
  // native-specific code
}

// FOR LARGE DIFFERENCES: use file variants
// MyComponent.web.js + MyComponent.native.js
```

## MCP Integration
- **context7**: When using Expo SDK features (Camera, ImagePicker, Notifications, Linking), ALWAYS fetch current Expo SDK 54 docs via context7. Expo APIs change significantly between SDK versions — using deprecated props/methods causes runtime crashes.

## General Rules
- ONLY modify files in `src/features/*/`
- NEVER modify shared components, contexts, or utils
- Always use theme system — no hardcoded colors
- Always handle loading/error states
- Use Hungarian labels for UI text (this is a Hungarian medical app)
