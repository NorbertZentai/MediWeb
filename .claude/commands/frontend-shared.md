# /frontend-shared - Shared components, contexts, hooks, and utilities agent

## Task
$ARGUMENTS

## Scope
- **Directories**:
  - `MediWeb_Frontend/src/components/` — shared UI components
  - `MediWeb_Frontend/src/components/ui/` — base UI primitives
  - `MediWeb_Frontend/src/contexts/` — React Contexts (AuthContext, ThemeContext)
  - `MediWeb_Frontend/src/hooks/` — custom hooks
  - `MediWeb_Frontend/src/utils/` — utility functions
  - `MediWeb_Frontend/src/styles/` — theme system (theme.js, Colors.ts)
  - `MediWeb_Frontend/src/api/` — API client (apiClient.js)

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. Identify what shared code to create or modify.
3. Follow existing patterns:
   - **Components**: Functional components with theme support via `useTheme()`
   - **Contexts**: `createContext` + Provider pattern (see AuthContext, ThemeContext)
   - **Hooks**: Custom hooks prefixed with `use`, returning state and actions
   - **Utils**: Platform-specific via `.native.js`/`.web.js` suffixes (see toast)
   - **Styles**: Central `theme.js` with `colors`, `spacing`, `borderRadius`, etc.
   - **API**: Axios instance with interceptors in `apiClient.js`
4. For shared components:
   - Accept `style` prop for overrides
   - Use theme colors, not hardcoded values
   - Handle web/native platform differences
5. For context changes:
   - Maintain backward compatibility — don't break existing consumers
   - Export both the context and the hook (e.g., `AuthContext` + `useAuth()`)
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### Shared Code Changes`.

## Cross-Platform Rules (CRITICAL)
Shared code is used by ALL screens on ALL platforms. Platform safety is paramount here.

### Pattern: Platform-Specific Utilities
When creating a new utility that behaves differently per platform:
```
utils/myUtil.web.js     ← web implementation
utils/myUtil.native.js  ← native implementation
```
Consumers import as `utils/myUtil` — Metro/Webpack resolves the correct variant.

### Pattern: Platform-Guarded Shared Component
```javascript
import { Platform } from "react-native";

export function MyComponent() {
  // Shared logic here
  if (Platform.OS === 'web') {
    return <WebVariant />;
  }
  return <NativeVariant />;
}
```

### Existing Platform Wrappers (ALWAYS use these)
| Concern | Wrapper | NEVER use directly |
|---------|---------|-------------------|
| Toast | `utils/toast` | `react-toastify`, `react-native-toast-message` |
| Haptics | `utils/haptics` | `expo-haptics` |
| Storage | `utils/storage` | `localStorage`, `AsyncStorage` |
| Notifications | `utils/notifications` | `expo-notifications` |

### If modifying a `.web.js` file, ALWAYS check the `.native.js` counterpart (and vice versa)

## MCP Integration
- **context7**: When creating/modifying shared hooks or utils that wrap React Native or Expo APIs, fetch current docs via context7 to verify the API surface hasn't changed. Shared code is high-impact — an incorrect API call here breaks ALL features.

## General Rules
- ONLY modify shared code directories listed above
- NEVER modify feature-specific screens
- Shared code must be platform-agnostic OR provide platform-specific variants
- Any change here affects MULTIPLE features — test thoroughly
- Maintain backward compatibility for context/hook APIs
