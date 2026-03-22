# /platform-guard - Cross-platform compatibility enforcement (Web + Native)

## Task
$ARGUMENTS

## Context
MediWeb runs on BOTH web (react-native-web) AND native (Android/iOS via Expo Go). Every code change MUST work on both platforms unless explicitly scoped to one.

## Steps

1. Get changed files: `git diff --name-only --diff-filter=ACMR HEAD` (or from pipeline-state.md).
2. Classify the change scope:
   - **UNIVERSAL** (default): Must work on web AND native. This is the default assumption.
   - **WEB-ONLY**: Explicitly scoped to web (e.g., "fix web dropdown positioning"). Only web platform matters.
   - **NATIVE-ONLY**: Explicitly scoped to native (e.g., "fix Android notification crash"). Only native platform matters.
   - Determine scope from the task description or `$ARGUMENTS`.

3. For each changed frontend file, run these checks:

### CHECK 1: Forbidden Web-Only APIs in Universal Code
Search for direct usage of browser APIs without platform guards:
```bash
ast-grep --pattern 'window.$PROP' --lang javascript [file]
ast-grep --pattern 'document.$METHOD' --lang javascript [file]
ast-grep --pattern 'navigator.$PROP' --lang javascript [file]
ast-grep --pattern 'localStorage.$METHOD' --lang javascript [file]
```
- **FAIL** if `window.*`, `document.*`, `navigator.*`, `localStorage.*` used WITHOUT `Platform.OS === 'web'` guard
- **PASS** if wrapped in platform check or in a `.web.js` file

### CHECK 2: Forbidden Native-Only APIs in Universal Code
Search for native-only APIs without platform guards:
```bash
ast-grep --pattern 'Alert.alert($$$)' --lang javascript [file]
ast-grep --pattern 'Haptics.$METHOD($$$)' --lang javascript [file]
ast-grep --pattern 'UIManager.$METHOD($$$)' --lang javascript [file]
```
- **FAIL** if `Alert.alert()` used WITHOUT web fallback (`window.confirm`/custom modal)
- **FAIL** if `Haptics.*` used WITHOUT `Platform.OS === 'web'` guard (use `utils/haptics.js` wrapper)
- **PASS** if in a `.native.js` file or properly guarded

### CHECK 3: Platform-Specific File Pairs
If a `.web.js` file is created or modified, check that its `.native.js` counterpart exists (and vice versa):
```bash
# If toast.web.js changed, toast.native.js must exist
fd -t f "$(basename changed_file .web.js).native.js" MediWeb_Frontend/src
```
- **FAIL** if one variant exists but the other doesn't
- **WARN** if only one variant was modified (other might need updates too)

### CHECK 4: Incompatible Libraries
Flag imports of known platform-restricted libraries in universal code:
- `react-toastify` → web-only, must be in `.web.js` file (use `utils/toast` wrapper)
- `react-native-toast-message` → native-only, must be in `.native.js` file (use `utils/toast` wrapper)
- `react-dom` → web-only, must be guarded with `Platform.OS === 'web'`
- `expo-haptics` → no-op on web, must use `utils/haptics.js` wrapper
- `expo-notifications` → currently mocked, check `utils/notifications.js`

### CHECK 5: Style Compatibility
Check that styles use cross-platform compatible properties:
```bash
# Shadow properties need Platform.select or boxShadow fallback for web
ast-grep --pattern 'shadowColor: $VAL' --lang javascript [file]
ast-grep --pattern 'shadowOffset: $VAL' --lang javascript [file]
ast-grep --pattern 'elevation: $VAL' --lang javascript [file]
```
- **WARN** if `shadowColor`/`shadowOffset`/`shadowRadius`/`elevation` used without `Platform.select()` or `boxShadow` web fallback
- Existing pattern in Navbar.style.js: `Platform.select({ web: { boxShadow: '...' }, default: { shadowColor: '...' } })`

### CHECK 6: Responsive Behavior
If the change affects layout:
- Check that `Dimensions` or `useWindowDimensions` is used instead of `window.innerWidth`
- Or if `window.innerWidth` is used, it must be guarded with `Platform.OS === 'web'`
- Check that `ScrollView`/`FlatList` is used instead of web-specific overflow patterns

4. Output structured report:
```
## Platform Guard Report
### Scope: [UNIVERSAL / WEB-ONLY / NATIVE-ONLY]

### Critical (blocks merge)
- [file:line] [CHECK-N] Description — breaks on [web/native]

### Warnings (review needed)
- [file:line] [CHECK-N] Description — may cause issues on [web/native]

### Platform-Specific Files Status
| Base Name | .web.js | .native.js | Status |
|-----------|---------|------------|--------|

### Verdict: PASS / WARN / FAIL
```

5. Update `.claude/pipeline-state.md` under `### Platform Guard`.

## Known Project Patterns (Reference)

These are the APPROVED platform abstraction patterns in this project:

| Concern | Pattern | Files |
|---------|---------|-------|
| Toast | `.web.js` / `.native.js` file variants | `utils/toast.*`, `components/ToastProvider.*` |
| Storage | `Platform.OS === 'web'` → localStorage / AsyncStorage | `utils/storage.js` |
| Haptics | Web no-op wrapper | `utils/haptics.js` |
| Notifications | Mocked + platform checks | `utils/notifications.js` |
| Confirmation | `Platform.OS === 'web'` → `window.confirm` / `Alert.alert` | `SettingsScreen.js` |
| File Input | `Platform.OS === 'web'` → `document.createElement('input')` | `ProfileHeader.js` |
| Dropdown | `Platform.OS` branching + ReactDOM portal on web | `CustomDropdown.js` |
| Shadows | `Platform.select({ web: boxShadow, default: shadow* })` | `Navbar.style.js` |
| API URL | `Platform.OS === 'android'` → `10.0.2.2` emulator | `api/config.js` |

## Rules
- READ-ONLY — report only, never fix
- Default scope is UNIVERSAL (both platforms) unless explicitly stated otherwise
- A single CRITICAL finding = FAIL verdict
- `.web.js` and `.native.js` files are EXEMPT from cross-platform checks (they ARE the platform-specific implementation)
- Files in `utils/` that already have platform wrappers (toast, haptics, storage) should be USED, not bypassed
- Backend files are EXEMPT from this check
