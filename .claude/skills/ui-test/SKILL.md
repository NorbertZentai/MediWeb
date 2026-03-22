---
name: ui-test
description: Visual UI testing on Android emulator + web browser — screenshots, tap, verify
allowed-tools: MCPTool(mobile-mcp:*), MCPTool(playwright:*), Bash(adb *), Read, Write
---

# /ui-test — Cross-Platform Visual UI Testing

## Task
$ARGUMENTS

## Platform Detection
Determine the test target from $ARGUMENTS:
- Contains "web" or "browser" → **Web testing** (use playwright MCP)
- Contains "android", "mobile", "emulator", or "native" → **Android testing** (use mobile-mcp)
- No specific platform → **Both** (test web first with playwright, then Android with mobile-mcp)

## Prerequisites
### For Android testing:
- Android emulator running OR physical device connected via USB
- App installed and running on the device
- ADB accessible (verified: `/opt/homebrew/bin/adb`)

### For Web testing:
- Expo web dev server running: `cd MediWeb_Frontend && npx expo start --web`
- App accessible at `http://localhost:8081`

## Steps

### Step 1: Device Check
- List connected devices using mobile-mcp `list_devices` tool
- If no device found, instruct user: `adb devices` to verify, or start emulator from Android Studio
- Report device name, Android version, screen resolution

### Step 2: Screenshot Baseline
- Take a screenshot of the current screen using mobile-mcp `screenshot` tool
- Describe what's visible: layout, text, buttons, navigation elements
- Identify the current screen/page in the app

### Step 3: Execute Test Scenario
Based on $ARGUMENTS, perform the requested UI test:
- **Navigate**: Use tap/swipe tools to navigate to the target screen
- **Interact**: Fill forms, press buttons, scroll lists
- **Verify**: Take screenshots after each action to confirm expected state
- **Compare**: Note any visual differences from expected behavior

### Step 4: Report
Output a visual test report:
```
## UI Test Report
### Device: [name] (Android [version])
### Scenario: $ARGUMENTS
### Steps Performed:
1. [action] → [result] ✅/❌
2. [action] → [result] ✅/❌
### Screenshots: [count] captured
### Issues Found:
- [issue description with screenshot reference]
### Platform Notes:
- [any platform-specific observations]
```

## Available mobile-mcp Tools
- `list_devices` — List connected Android devices/emulators
- `screenshot` — Capture current screen
- `list_elements` — Get all clickable UI elements with coordinates
- `tap` — Tap at specific coordinates
- `swipe` — Swipe gesture (scroll, navigate)
- `type_text` — Enter text into focused field
- `press_button` — Press device buttons (back, home, etc.)
- `launch_app` — Start an application
- `terminate_app` — Close an application

## Web Testing (Playwright MCP)
When testing the web version, use playwright MCP tools:
- `browser_navigate` — Open URL (`http://localhost:8081`)
- `browser_snapshot` — Accessibility snapshot (element tree with roles, names, states)
- `browser_click` — Click element by accessible name or role
- `browser_type` — Type into input field
- `browser_select_option` — Select dropdown option
- `browser_resize` — Test responsive behavior at different viewports
- `browser_handle_dialog` — Handle confirm/alert dialogs

### Cross-Platform Comparison
When testing both platforms, compare:
- Do the same elements exist on both? (check for web-only or native-only features)
- Are interactions consistent? (e.g., `window.confirm` on web vs `Alert.alert` on native)
- Do styles render the same? (shadows, scrolling, hover states)

## Rules
- Always take a screenshot BEFORE and AFTER each interaction
- Report coordinates of tapped elements for reproducibility
- If an element is not found, try scrolling first before reporting failure
- Use Hungarian text for verification (this is a Hungarian app)
- Compare actual vs expected UI state for each step
- When testing both platforms, always report cross-platform differences
