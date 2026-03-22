---
name: web-test
description: Visual web UI testing via Playwright — navigate, interact, verify the MediWeb web version
allowed-tools: MCPTool(playwright:*), Bash(npx expo *), Read, Write
---

# /web-test — Web Browser UI Testing

## Task
$ARGUMENTS

## Prerequisites
- Expo web dev server running on `http://localhost:8081` (run `cd MediWeb_Frontend && npx expo start --web`)
- OR production web build accessible at a URL
- Playwright MCP server configured in `.mcp.json`

## Steps

### Step 1: Verify Dev Server
- Check if Expo web dev server is running. If not, instruct user to start it:
  ```bash
  cd MediWeb_Frontend && npx expo start --web
  ```
- Wait for the server to be accessible

### Step 2: Navigate to Target
- Use playwright MCP to open the web app in a browser
- Navigate to the screen specified in $ARGUMENTS
- If login is required, navigate through the auth flow first

### Step 3: Accessibility Snapshot
- Take an accessibility snapshot of the current page (playwright uses accessibility tree, not screenshots)
- List all interactive elements: buttons, inputs, links, with their labels and states
- Identify the page structure and layout

### Step 4: Execute Test Scenario
Based on $ARGUMENTS, perform the requested test:
- **Form testing**: Fill input fields, submit forms, verify validation errors
- **Navigation testing**: Click links/buttons, verify correct page transitions
- **State testing**: Trigger state changes, verify UI updates
- **Responsive testing**: Check layout at different viewport sizes
- **Error testing**: Submit invalid data, verify error messages

### Step 5: Platform Comparison Notes
For each tested element, note:
- Does this element exist in the native version? (check `.native.js` variants)
- Are there web-specific styles? (check `Platform.select` usage)
- Any web-only functionality? (file upload via `<input type="file">`, etc.)

### Step 6: Report
```
## Web UI Test Report
### URL: [tested URL]
### Scenario: $ARGUMENTS

### Page Structure
- [element hierarchy from accessibility snapshot]

### Interactions Tested
1. [action] → [result] ✅/❌
2. [action] → [result] ✅/❌

### Issues Found
- [issue description with element selector]

### Platform Compatibility Notes
- Web-specific: [elements/features only on web]
- Missing from web: [native features not available on web]

### Recommendations
- [action items]
```

## Available Playwright MCP Tools
- `browser_navigate` — Navigate to a URL
- `browser_snapshot` — Take accessibility snapshot of current page
- `browser_click` — Click an element (by text, role, or selector)
- `browser_type` — Type text into an input field
- `browser_select_option` — Select from dropdown
- `browser_hover` — Hover over an element
- `browser_drag` — Drag and drop
- `browser_press_key` — Press keyboard key
- `browser_resize` — Resize browser viewport
- `browser_handle_dialog` — Accept/dismiss dialogs (alert, confirm, prompt)
- `browser_tab_list` — List open tabs
- `browser_close` — Close browser

## Rules
- Playwright uses accessibility snapshots (not screenshots) — describe elements by their accessible name/role
- Always test with the Hungarian locale in mind (form labels, error messages are in Hungarian)
- If the dev server is not running, clearly instruct the user to start it
- Compare findings with native behavior where relevant
- Report web-specific CSS issues (shadows, scrolling, hover states)
