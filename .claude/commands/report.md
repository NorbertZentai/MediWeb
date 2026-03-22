# /report - Generate pipeline summary and clean up

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` fully.
2. Compile a final summary from all sections:
   ```
   ## Pipeline Report: [Task Name]

   ### Summary
   [1-2 sentence overview of what was done]

   ### Changes Made
   | File | Change Type | Description |
   |------|------------|-------------|
   | path/to/file | Added/Modified/Deleted | Brief description |

   ### Test Results
   [Pass/fail summary]

   ### QA Results
   [Issues found, if any]

   ### Review Notes
   [Any pattern/security/perf issues found]

   ### Files Changed
   [Output of git diff --stat]

   ### Status: SUCCESS / PARTIAL / FAILED
   [Overall pipeline status with explanation]
   ```
3. Run `git diff --stat` to get actual file change stats.
4. Print the full report to the user.
5. Delete `.claude/pipeline-state.md` to clean up.

## MCP Integration
- **memory**: After generating the report, store a summary of key decisions, patterns used, and lessons learned in the memory MCP knowledge graph. This enables future pipeline runs to learn from past experience. Store entries like: `{task: "description", outcome: "success/fail", key_decisions: [...], lessons: [...]}`.

## Rules
- Always include `git diff --stat` for concrete change metrics
- Be honest about failures — don't hide issues
- If pipeline was partially successful, say so clearly
- Delete pipeline-state.md after producing the report
