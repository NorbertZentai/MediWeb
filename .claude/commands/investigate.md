# /investigate - Bug investigation pipeline

## Task
$ARGUMENTS

## Pipeline

### Step 0: Branch Guard
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/branch-guard.md`. Check the current git branch."
- If FAIL -> STOP.

### Step 1: Initialize Pipeline State
- Create `.claude/pipeline-state.md`:
  ```
  # Pipeline State — Investigate
  Started: [timestamp]
  Bug Report: $ARGUMENTS

  ## Progress
  | Step | Agent | Status | Notes |
  |------|-------|--------|-------|
  ```

### Step 2: Scout
- Use **Task tool** (model: **haiku**, subagent_type: **Explore**)
- Prompt: "Read and follow `.claude/commands/scout.md`. Bug report: $ARGUMENTS. Find all files potentially related to this bug. Check recent git history for related changes: `git log --oneline -20`. Update `.claude/pipeline-state.md` under `### Scout Context`."

### Step 3: Diagnose
- Use **Task tool** (model: **opus**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Investigate this bug: $ARGUMENTS. Read the relevant files identified by scout. Trace the execution path. Identify the root cause. Check for:
  - Backend: stack traces, null pointer paths, missing validations, JPA mapping issues, SQL errors
  - Frontend: state management bugs, race conditions, platform-specific issues, API response handling
  **MCP tools available**:
  - Use **sentry** MCP to search for related production errors, stack traces, breadcrumbs, and user impact data.
  - Use **sequential-thinking** MCP for complex bugs spanning multiple layers — decompose the execution path step by step.
  - Use **postgres** MCP to verify database state if the bug involves data issues (query actual data/schema).
  - Use **context7** MCP to check if a library API changed or was deprecated if the bug might be version-related.
  Document your findings under `### Root Cause Analysis` in pipeline state."

### Step 4: Fix
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Apply the minimal fix for the root cause identified. Follow the layer-specific rules from the relevant agent files (`.claude/commands/backend-*.md` or `.claude/commands/frontend-*.md`). Update pipeline state under `### Fix Applied`."

### Step 5: Platform Guard
(Skip if no frontend files were changed by the fix)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/platform-guard.md`. Verify the fix is cross-platform compatible. The bug scope is: $ARGUMENTS. Determine if this is a UNIVERSAL, WEB-ONLY, or NATIVE-ONLY fix. If the bug is platform-specific (e.g., 'crash on Android'), the fix should ONLY target that platform without breaking the other. Update pipeline state under `### Platform Guard`."
- **On FAIL**: Route back to Step 4 with platform compatibility fix instructions.

### Step 6: Test
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/test.md`. Verify the fix compiles and passes tests. Update pipeline state under `### Test Results`."
- **On FAIL**: Route back to Step 4 with fix instructions. Retry up to 2 times.
- **On 3rd FAIL**: Call `/diagnostic`, then STOP.

### Step 7: Report
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/report.md`. Generate bug fix report. Clean up pipeline state."

## Rules
- Focus on MINIMAL fix — don't refactor surrounding code
- Always trace the full execution path before fixing
- If the bug involves both backend and frontend, fix backend first
- Include reproduction steps in the report
