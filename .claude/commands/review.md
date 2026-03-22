# /review - Multi-check code review pipeline

## Task
$ARGUMENTS

## Pipeline

### Step 1: Initialize Pipeline State
- Create `.claude/pipeline-state.md`:
  ```
  # Pipeline State — Review
  Started: [timestamp]
  Scope: $ARGUMENTS

  ## Progress
  | Step | Agent | Status | Notes |
  |------|-------|--------|-------|
  ```

### Step 2: Get Changed Files
- Run: `git diff --name-only --diff-filter=ACMR HEAD` (or compare against specified branch)
- If no changes found, report "Nothing to review" and STOP.
- Store file list in pipeline state.

### Step 3: Parallel Review (run all 4 in parallel)

#### Step 3a: Pattern Check
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/pattern-check.md`. Review changed files for convention violations. Update pipeline state under `### Pattern Check`."

#### Step 3b: Security Check
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/security-check.md`. Review changed files for security vulnerabilities. Update pipeline state under `### Security Check`."

#### Step 3c: Performance Check
- Use **Task tool** (model: **sonnet**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/perf-check.md`. Review changed files for performance issues. Update pipeline state under `### Performance Check`."

#### Step 3d: Platform Guard
(Skip if no frontend files in changed files list)
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/platform-guard.md`. Review changed frontend files for cross-platform compatibility issues. Scope: UNIVERSAL (unless task specifies otherwise). Update pipeline state under `### Platform Guard`."

### Step 4: QA Analysis
- Use **Task tool** (model: **opus**, subagent_type: **general-purpose**)
- Prompt: "Read `.claude/pipeline-state.md` for context. Read and follow `.claude/commands/qa.md`. Perform quality assurance analysis on changed files. Consider the results from pattern-check, security-check, perf-check, and platform-guard when forming your assessment. Update pipeline state under `### QA Results`."

### Step 5: Report
- Use **Task tool** (model: **haiku**, subagent_type: **general-purpose**)
- Prompt: "Read and follow `.claude/commands/report.md`. Generate comprehensive review report combining all check results. Clean up pipeline state."

## Rules
- This pipeline is READ-ONLY — never modify code, only report issues
- Steps 3a, 3b, 3c, 3d run in PARALLEL for efficiency
- If comparing against a branch, use `git diff branch...HEAD --name-only`
- Default comparison is staged + unstaged changes
- To review a specific PR: pass the base branch as argument
