# /minimize - Reduce diff to minimum necessary changes

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` for context on what the task requires.
2. Run `git diff` to see all current changes.
3. For each changed file, evaluate:
   - Is this change **necessary** for the task?
   - Are there **formatting-only** changes mixed in?
   - Are there **unrelated refactors** that crept in?
   - Are there **unnecessary import additions**?
   - Are there **added comments/docs** that weren't requested?
4. For unnecessary changes:
   - Revert formatting-only changes
   - Revert unrelated refactors
   - Revert unnecessary import reorganization
   - Keep ONLY changes directly related to the task
5. Output a report:
   ```
   ## Minimize Report
   ### Kept Changes
   - file.java: [reason — directly related to task]
   ### Reverted Changes
   - file.java: [reason — formatting only / unrelated]
   ### Final Diff Stats
   [files changed, insertions, deletions]
   ```
6. Update `.claude/pipeline-state.md` under `### Minimize Results`.

## Rules
- Be aggressive about reverting — when in doubt, revert
- Never revert functional changes needed for the task
- Use `git checkout -- file` to revert entire files, or `Edit` for partial reverts
- Run `git diff --stat` before and after to show improvement
