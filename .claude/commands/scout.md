# /scout - Quick codebase scan to identify relevant files

## Task
$ARGUMENTS

## Steps

1. Understand the task description and determine which parts of the codebase are relevant.
2. Use efficient search strategies (in order of preference):
   - `fd` for file name patterns: `fd -t f 'pattern' MediWeb_Backend/src` or `fd -t f 'pattern' MediWeb_Frontend/src`
   - `Grep` tool for content search across the codebase
   - `Glob` tool for glob patterns
   - `ast-grep` for structural code patterns: `ast-grep --pattern '$PATTERN' --lang java` or `ast-grep --pattern '$PATTERN' --lang javascript`
3. For backend tasks, focus on:
   - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/` — modular structure
   - `MediWeb_Backend/src/main/java/hu/project/MediWeb/config/` — configuration
   - `MediWeb_Backend/src/main/java/hu/project/MediWeb/security/` — security
   - `MediWeb_Backend/src/main/resources/` — YAML config, templates
4. For frontend tasks, focus on:
   - `MediWeb_Frontend/src/features/` — feature modules
   - `MediWeb_Frontend/src/components/` — shared components
   - `MediWeb_Frontend/src/contexts/` — state management
   - `MediWeb_Frontend/src/api/` — API client
   - `MediWeb_Frontend/src/hooks/` — custom hooks
   - `MediWeb_Frontend/src/utils/` — utilities
   - `MediWeb_Frontend/src/styles/` — theme system
5. Output a structured file list:
   ```
   ## Scout Results
   ### Primary Files (must modify)
   - path/to/file.java — reason
   ### Secondary Files (may need changes)
   - path/to/file.js — reason
   ### Reference Files (read-only context)
   - path/to/file.yml — reason
   ```

## Token Optimization
- Use `fd` and `Grep` BEFORE reading any files
- Never speculatively read files — search first, read only confirmed matches
- Use `Read` with `offset` and `limit` for large files
- Limit output to max 30 files

## MCP Integration
- **fetch**: If the task references external APIs or services (e.g., OGYÉI medication database, Google Image API), use fetch MCP to check the current API documentation for any relevant endpoint changes or deprecations.

## Rules
- This agent is READ-ONLY — never modify files
- Output must be structured for downstream agents to consume
- If the task spans both backend and frontend, organize by stack
- Update `.claude/pipeline-state.md` under `### Scout Context` with results
