---
name: visual-diff
description: Visual UI comparison — before/after code changes on Android emulator AND web browser
allowed-tools: MCPTool(mobile-mcp:*), MCPTool(playwright:*), Bash(adb *), Bash(difft *), Read, Write
---

# /visual-diff — Visual Before/After Comparison

## Task
$ARGUMENTS

## Purpose
Take "before" snapshots, apply code changes, rebuild, and take "after" snapshots to visually verify UI changes. Tests BOTH web (via playwright) and native (via mobile-mcp) for complete cross-platform verification.

## Steps

### Step 1: Before Screenshots
- Verify emulator is running with mobile-mcp `list_devices`
- Navigate to the screen(s) specified in $ARGUMENTS
- Take screenshots of each target screen → save references as "before" state
- List all visible UI elements with coordinates

### Step 2: Wait for Changes
- Report: "Before screenshots captured. Apply your code changes and rebuild the app."
- Instruct user to:
  1. Make their code changes
  2. Run `npx expo start` (or the app reloads via hot-reload)
  3. Tell Claude to continue

### Step 3: After Screenshots
- Take screenshots of the same screens → "after" state
- List all visible UI elements with coordinates

### Step 4: Comparison
For each screen pair (before/after):
- **Layout changes**: New/removed/moved elements
- **Text changes**: Modified labels, values, placeholders
- **Style changes**: Colors, sizes, spacing, shadows
- **State changes**: Loading indicators, error messages, empty states
- **Platform concerns**: Any elements that might not render correctly on the other platform (web vs native)

### Step 5: Report
```
## Visual Diff Report
### Screen: [name]

#### Before → After Changes
| Element | Before | After | Change Type |
|---------|--------|-------|-------------|
| [element] | [state] | [state] | Added/Removed/Modified |

#### Visual Assessment
- Layout: ✅ No issues / ⚠️ [issue]
- Spacing: ✅ / ⚠️
- Colors: ✅ / ⚠️
- Text: ✅ / ⚠️

#### Platform Compatibility
- Web impact: [assessment]
- Native impact: [assessment]

#### Recommendation
- [action items if any issues found]
```

## Web Testing (Playwright)
In addition to Android screenshots, also capture web snapshots:
- Use `browser_navigate` to open `http://localhost:8081` and navigate to the same screen
- Use `browser_snapshot` for accessibility tree comparison (before/after)
- Use `browser_resize` to test at mobile (375px) and desktop (1280px) widths
- Compare web vs native rendering for the same UI elements

## Rules
- Always capture the EXACT same screens and navigation state for before/after
- Report element-level observations (positions, sizes, labels)
- Test BOTH web (playwright) AND native (mobile-mcp) when both are available
- Flag any changes that might break the other platform (web/native)
- If the emulator or dev server is not running, provide clear setup instructions
- Use Hungarian context for UI text verification
