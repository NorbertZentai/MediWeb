# /refactor - Safe refactoring pipeline

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
  # Pipeline State — Refactor
  Started: [timestamp]
  Task: $ARGUMENTS

  ## Progress
  | Step | Agent | Status | Notes |
  |------|-------|--------|-------|
  ```

### Step 2: Scout
- Use **Task tool** (model: **haiku**, subagent_type: **Explore**)
- Prompt: "Read and follow `.claude/commands/scout.md`. Refactoring task: $ARGUMENTS. Identify all files that will be affected by this refactoring, including consumers/callers. Update `.claude/pipeline-state.md` under `### Scout Context`."

### Step 3: Plan
- Use **Task tool** (model: **opus**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Plan the safest refactoring approach for: $ARGUMENTS. Consider:
  - What can break? List all call sites.
  - What's the order of changes to avoid compile errors?
  - Can we do this in steps that each independently compile?
  Document the plan under `### Refactor Plan` in pipeline state."

### Step 4: Apply Refactor
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Apply the refactoring plan step by step. Follow layer-specific rules from `.claude/commands/backend-*.md` and `.claude/commands/frontend-*.md`. Update pipeline state under `### Refactor Applied`."

### Step 5: Platform Guard
(Skip if no frontend files were refactored)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/platform-guard.md`. Verify all refactored frontend code maintains cross-platform compatibility. Scope: UNIVERSAL. Update pipeline state under `### Platform Guard`."
- **On FAIL**: Route back to Step 4 to fix platform issues.

### Step 6: Build & Test
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/test.md`. Build and verify refactoring didn't break anything. Update pipeline state under `### Test Results`."
- **On FAIL**: Route back to Step 4 with fix instructions. Retry up to 2 times.
- **On 3rd FAIL**: Call `/diagnostic`, then STOP.

### Step 7: Minimize
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/minimize.md`. Ensure only refactoring changes are included — no feature additions. Update pipeline state."

### Step 8: Report
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/report.md`. Generate refactoring report. Clean up pipeline state."

## Rules
- Refactoring must NOT change behavior — only structure
- Each step should leave the project in a compilable state
- If refactoring is too large, break it into sub-tasks
- Always verify with build before reporting success
