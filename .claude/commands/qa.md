# /qa - Quality assurance analysis

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. Get changed files: `git diff --name-only --diff-filter=ACMR HEAD` (or vs base branch).
3. For each changed file, analyze:
   - **Correctness**: Does the logic do what's intended?
   - **Error handling**: Are errors properly caught and reported?
   - **Null safety**: Are null/undefined checks in place where needed?
   - **Edge cases**: Are boundary conditions handled?
   - **Thread safety** (backend): Are shared resources properly synchronized?
   - **Platform safety** (frontend): Does it work on web AND native?
4. Check for common issues:
   - **Backend**: N+1 queries, missing `@Transactional`, unclosed resources, SQL injection via string concat
   - **Frontend**: Missing cleanup in `useEffect`, stale closures, missing error boundaries, memory leaks
5. Output structured QA report:
   ```
   ## QA Report
   ### Critical Issues
   - [file:line] Issue description
   ### Warnings
   - [file:line] Warning description
   ### Suggestions
   - [file:line] Suggestion
   ### Verdict: PASS / FAIL
   ```
6. Update `.claude/pipeline-state.md` under `### QA Results`.

## MCP Integration
- **sequential-thinking**: For changes spanning multiple layers (BE+FE), use sequential-thinking to trace the full request path (API call → controller → service → repository → DB → response → frontend state) and verify each step is correct.
- **context7**: If the code uses a library API you're unsure about, fetch current docs via context7 to verify correct usage before flagging as an issue.

## Rules
- READ-ONLY — report issues but never fix them
- Only analyze changed files (use `git diff --name-only`)
- Use `git diff` to see actual changes, not full file reads
- Prioritize: Critical > Warnings > Suggestions
- A single critical issue = FAIL verdict
