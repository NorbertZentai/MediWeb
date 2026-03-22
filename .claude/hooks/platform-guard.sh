#!/bin/bash
# PostToolUse hook: Platform-guard feedback for frontend files
# Checks for web-only/native-only APIs used without Platform.OS guards
# Runs after Edit/Write on MediWeb_Frontend .js/.ts/.tsx files

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name')

# Only process Edit/Write
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  exit 0
fi

# Only frontend JS/TS files
if [[ ! "$FILE_PATH" =~ \.(js|jsx|ts|tsx)$ ]]; then
  exit 0
fi

# Only MediWeb_Frontend files
if [[ "$FILE_PATH" != *MediWeb_Frontend* ]]; then
  exit 0
fi

# Skip platform-specific files (they ARE the platform implementation)
if [[ "$FILE_PATH" =~ \.(web|native)\.(js|jsx|ts|tsx)$ ]]; then
  exit 0
fi

# Skip non-existent files
if [[ ! -f "$FILE_PATH" ]]; then
  exit 0
fi

WARNINGS=""

# CHECK 1: Web-only APIs without platform guard
# Look for window.*, document.*, localStorage.* without Platform.OS check
if grep -qE '\bwindow\.\b|\bdocument\.\b|\blocalStorage\.\b' "$FILE_PATH" 2>/dev/null; then
  if ! grep -qE 'Platform\.OS\s*===?\s*['\''"]web['\''"]|Platform\.select' "$FILE_PATH" 2>/dev/null; then
    WARNINGS="${WARNINGS}Web-only API (window/document/localStorage) used without Platform.OS guard. "
  fi
fi

# CHECK 2: Native-only APIs without platform guard
# Alert.alert without web fallback
if grep -qE '\bAlert\.alert\b' "$FILE_PATH" 2>/dev/null; then
  if ! grep -qE 'Platform\.OS\s*===?\s*['\''"]web['\''"]|window\.confirm|Platform\.select' "$FILE_PATH" 2>/dev/null; then
    WARNINGS="${WARNINGS}Alert.alert() used without web fallback (window.confirm). "
  fi
fi

# CHECK 3: Incompatible library imports in universal files
if grep -qE "from ['\"]react-toastify['\"]" "$FILE_PATH" 2>/dev/null; then
  WARNINGS="${WARNINGS}react-toastify imported in universal file (web-only library, use utils/toast wrapper). "
fi

if grep -qE "from ['\"]react-native-toast-message['\"]" "$FILE_PATH" 2>/dev/null; then
  if [[ "$FILE_PATH" != *.native.* ]]; then
    WARNINGS="${WARNINGS}react-native-toast-message imported in universal file (native-only, use utils/toast wrapper). "
  fi
fi

# CHECK 4: Shadow styles without Platform.select
if grep -qE 'shadowColor:|shadowOffset:|elevation:' "$FILE_PATH" 2>/dev/null; then
  if ! grep -qE 'Platform\.select|boxShadow' "$FILE_PATH" 2>/dev/null; then
    WARNINGS="${WARNINGS}Shadow/elevation styles without Platform.select() web fallback. "
  fi
fi

# Output feedback
if [[ -n "$WARNINGS" ]]; then
  # Escape for JSON
  WARNINGS_JSON=$(echo "$WARNINGS" | sed 's/"/\\"/g')
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PostToolUse\",\"additionalContext\":\"PLATFORM GUARD WARNING in $(basename "$FILE_PATH"): ${WARNINGS_JSON}Consider using Platform.OS guards or platform-specific file variants (.web.js/.native.js). See .claude/commands/platform-guard.md for approved patterns.\"}}"
fi

exit 0
