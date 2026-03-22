# /branch-guard - Block work on protected branches

## Task
Check the current git branch and BLOCK if it is a protected branch.

## Steps

1. Run `git branch --show-current` to get the current branch name.
2. Check if the branch matches any protected pattern:
   - `master`
   - `main`
   - `develop`
   - `release`
3. If on a protected branch:
   - Output: `BRANCH GUARD FAIL: Currently on protected branch '[branch]'. Create a feature branch first: git checkout -b feature/your-feature-name`
   - **STOP immediately** — do not proceed.
4. If on a safe branch (e.g., `feature/*`, any other):
   - Output: `BRANCH GUARD OK: On branch '[branch]'`
   - Proceed.

## Rules
- This agent is READ-ONLY — never run git commands that modify anything
- Always run as Step 0 in any orchestrator pipeline
- FAIL FAST — no retries, no workarounds
