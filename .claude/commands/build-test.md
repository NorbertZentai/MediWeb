# /build-test - Build and test pipeline

## Task
$ARGUMENTS

## Pipeline

### Step 1: Initialize Pipeline State
- Create `.claude/pipeline-state.md`:
  ```
  # Pipeline State — Build & Test
  Started: [timestamp]
  Scope: $ARGUMENTS

  ## Progress
  | Step | Agent | Status | Notes |
  |------|-------|--------|-------|
  ```

### Step 2: Backend Build
(Skip if `$ARGUMENTS` specifies frontend-only)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Build the backend. Run: `cd MediWeb_Backend && ./mvnw compile -q 2>&1 | tail -30`. Report result. Update `.claude/pipeline-state.md` under `### Backend Build`."
- If FAIL -> Call `/diagnostic`, report to user.

### Step 3: Backend Tests
(Skip if build failed or frontend-only)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md`. Run backend tests: `cd MediWeb_Backend && ./mvnw test 2>&1 | tail -50`. Parse results. Update pipeline state under `### Backend Tests`."
- If FAIL -> Call `/diagnostic`, report to user.

### Step 4: Frontend Build
(Skip if `$ARGUMENTS` specifies backend-only)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Build the frontend. Run: `cd MediWeb_Frontend && npx expo export --platform web 2>&1 | tail -30`. Report result. Update `.claude/pipeline-state.md` under `### Frontend Build`."
- If FAIL -> Call `/diagnostic`, report to user.

### Step 5: Frontend Tests
(Skip if build failed or backend-only)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md`. Run frontend tests: `cd MediWeb_Frontend && npx jest --passWithNoTests 2>&1 | tail -30`. Parse results. Update pipeline state under `### Frontend Tests`."
- If FAIL -> Call `/diagnostic`, report to user.

### Step 6: Report
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/report.md`. Generate build/test report. Clean up pipeline state."

## Rules
- Always pipe build output through `tail` to limit token usage
- Use `-q` (quiet) flag for Maven where possible
- Report EXACT error messages for failures
- If all pass, report a clean summary with timing info
- If $ARGUMENTS is empty, run BOTH backend and frontend
