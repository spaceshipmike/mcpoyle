#!/bin/bash
# Electron security guard — runs as a PostToolUse hook on Edit/Write.
# Blocks edits that introduce dangerous Electron settings.

FILE=$(jq -r '.file_path // .filePath // empty' "$1" 2>/dev/null)
[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

echo "$FILE" | grep -qE '\.(ts|tsx|js|jsx|mjs)$' || exit 0

ISSUES=""

if grep -qE 'nodeIntegration\s*:\s*true' "$FILE" 2>/dev/null; then
  ISSUES+="BLOCKED: nodeIntegration must never be enabled\n"
fi
if grep -qE 'contextIsolation\s*:\s*false' "$FILE" 2>/dev/null; then
  ISSUES+="BLOCKED: contextIsolation must never be disabled\n"
fi
if grep -qE 'webSecurity\s*:\s*false' "$FILE" 2>/dev/null; then
  ISSUES+="BLOCKED: webSecurity must never be disabled\n"
fi
if grep -qE 'allowRunningInsecureContent\s*:\s*true' "$FILE" 2>/dev/null; then
  ISSUES+="BLOCKED: allowRunningInsecureContent must never be enabled\n"
fi
if grep -qE 'experimentalFeatures\s*:\s*true' "$FILE" 2>/dev/null; then
  ISSUES+="BLOCKED: experimentalFeatures must never be enabled\n"
fi

if grep -qE 'sandbox\s*:\s*false' "$FILE" 2>/dev/null; then
  ISSUES+="WARNING: sandbox disabled — justify in commit message\n"
fi
if grep -qE 'shell\.openExternal\(' "$FILE" 2>/dev/null; then
  ISSUES+="WARNING: shell.openExternal — ensure URL is validated before opening\n"
fi
if grep -qE '\beval\s*\(' "$FILE" 2>/dev/null && echo "$FILE" | grep -qv 'node_modules'; then
  ISSUES+="WARNING: eval() detected — avoid in renderer process\n"
fi
if grep -qE 'new\s+Function\s*\(' "$FILE" 2>/dev/null; then
  ISSUES+="WARNING: new Function() detected — avoid in renderer process\n"
fi

if [ -n "$ISSUES" ]; then
  echo -e "$ISSUES"
  echo "$ISSUES" | grep -q "BLOCKED" && exit 1
fi

exit 0
