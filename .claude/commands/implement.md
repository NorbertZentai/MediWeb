# /implement - Full feature implementation pipeline

## Task
$ARGUMENTS

## Pipeline

### Step 0: Branch Guard
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/branch-guard.md`. Check the current git branch."
- If FAIL -> STOP and tell user to create a feature branch.

### Step 1: Initialize Pipeline State
- Create `.claude/pipeline-state.md`:
  ```
  # Pipeline State — Implement
  Started: [timestamp]
  Task: $ARGUMENTS

  ## Progress
  | Step | Agent | Status | Notes |
  |------|-------|--------|-------|
  ```

### Step 2: Scout
- Use **Task tool** (model: **haiku**, subagent_type: **Explore**)
- Prompt: "Read and follow `.claude/commands/scout.md`. Task: $ARGUMENTS. Identify all files that need to be modified for this feature. Update `.claude/pipeline-state.md` under `### Scout Context`."

### Step 3: Spec
- Use **Task tool** (model: **opus**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/spec.md`. Create a technical specification for: $ARGUMENTS. Update pipeline state under `### Spec`."

### Step 4: Code — Backend Entity/DTO
(Skip if no backend changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/backend-entity.md`. Implement entity/DTO/repository changes from the spec. Update pipeline state under `### Entity Changes`."

### Step 5: Code — Backend Service
(Skip if no backend changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/backend-service.md`. Implement service layer changes from the spec. Update pipeline state under `### Service Changes`."

### Step 6: Code — Backend Controller
(Skip if no backend changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/backend-controller.md`. Implement controller changes from the spec. Update pipeline state under `### Controller Changes`."

### Step 7: Code — Backend Config
(Skip if no config changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/backend-config.md`. Implement configuration changes from the spec. Update pipeline state under `### Config Changes`."

### Step 8: Code — Frontend API
(Skip if no frontend changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/frontend-api.md`. Implement API integration changes from the spec. Update pipeline state under `### API Changes`."

### Step 9: Code — Frontend Screen
(Skip if no frontend changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/frontend-screen.md`. Implement screen/component changes from the spec. Update pipeline state under `### Screen Changes`."

### Step 10: Code — Frontend Shared
(Skip if no shared component changes needed)
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/frontend-shared.md`. Implement shared code changes from the spec. Update pipeline state under `### Shared Changes`."

### Step 11: Platform Guard
(Skip if no frontend changes were made)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/platform-guard.md`. Check ALL changed frontend files for cross-platform compatibility. The task scope is: $ARGUMENTS. Determine if scope is UNIVERSAL, WEB-ONLY, or NATIVE-ONLY based on the task description. Update pipeline state under `### Platform Guard`."
- **On FAIL**: Route back to the relevant frontend code agent (Steps 8-10) with fix instructions from the platform guard report. The fix MUST address the platform incompatibility before proceeding.

### Step 12: Build & Test
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/test.md`. Build and test the changes. For backend: `cd MediWeb_Backend && ./mvnw compile -q 2>&1 | tail -20`. For frontend: `cd MediWeb_Frontend && npx expo export --platform web 2>&1 | tail -20`. Update pipeline state under `### Test Results`."
- **On FAIL**: Route back to relevant code agent (Steps 4-10) with fix instructions. Retry up to 2 times (3 total attempts).
- **On 3rd FAIL**: Call `/diagnostic` agent, then STOP.

### Step 13: Minimize
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/minimize.md`. Remove any unnecessary changes from the diff. Update pipeline state under `### Minimize Results`."

### Step 14: Report
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/report.md`. Generate final implementation report. Clean up pipeline state."

## On Failure
If any step fails after retries:
1. Update pipeline state with error details
2. Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**) with prompt: "Read and follow `.claude/commands/diagnostic.md`. Analyze the failure. $ARGUMENTS"
3. Print diagnostic to user

## Rules
- Skip steps that don't apply (e.g., skip frontend steps for backend-only changes)
- Each code agent works in its own layer — never let one agent modify another layer's files
- Pipeline state is the single source of truth between agents
- Always run branch guard first
- Backend changes follow order: Entity -> Service -> Controller -> Config
- Frontend changes follow order: API -> Screen -> Shared
