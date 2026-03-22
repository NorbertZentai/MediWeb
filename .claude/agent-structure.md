# MediWeb Agent System Structure

## Overview
Hierarchical agent system with orchestrators delegating to specialized sub-agents via the Task tool.

## Orchestrator Pipelines

### /implement — Full Feature Implementation
```
Step 0:  branch-guard (haiku)
    │ FAIL → STOP
    ▼
Step 1:  Initialize pipeline-state.md
    ▼
Step 2:  scout (haiku/Explore)
    ▼
Step 3:  spec (opus)
    ▼
Step 4:  backend-entity (sonnet)     ─── Skip if no BE changes
    ▼
Step 5:  backend-service (sonnet)    ─── Skip if no BE changes
    ▼
Step 6:  backend-controller (sonnet) ─── Skip if no BE changes
    ▼
Step 7:  backend-config (sonnet)      ─── Skip if no config changes
    ▼
Step 8:  frontend-api (sonnet)       ─── Skip if no FE changes
    ▼
Step 9:  frontend-screen (sonnet)    ─── Skip if no FE changes
    ▼
Step 10: frontend-shared (sonnet)    ─── Skip if no shared changes
    ▼
Step 11: ★ PLATFORM GUARD (haiku)  ←── Skip if no FE changes
    │ FAIL → back to FE code agent to fix platform issues
    ▼
Step 12: test (haiku)  ←──────────── Retry loop (max 2 retries)
    │ FAIL → back to relevant code agent
    │ 3rd FAIL → diagnostic → STOP
    ▼
Step 13: minimize (haiku)
    ▼
Step 14: report (haiku) → Clean up pipeline-state.md
```

### /investigate — Bug Investigation
```
Step 0: branch-guard (haiku)
    ▼
Step 1: Initialize pipeline-state.md
    ▼
Step 2: scout (haiku/Explore)
    ▼
Step 3: diagnose (opus) — Root cause analysis
    ▼
Step 4: fix (sonnet)
    ▼
Step 5: ★ PLATFORM GUARD (haiku) ← Skip if no FE files changed
    │ FAIL → back to fix step
    ▼
Step 6: test (haiku) ←─── Retry loop (max 2)
    ▼
Step 7: report (haiku)
```

### /refactor — Safe Refactoring
```
Step 0: branch-guard (haiku)
    ▼
Step 1: Initialize pipeline-state.md
    ▼
Step 2: scout (haiku/Explore)
    ▼
Step 3: plan (opus) — Refactoring plan
    ▼
Step 4: apply (sonnet)
    ▼
Step 5: ★ PLATFORM GUARD (haiku) ← Skip if no FE files changed
    │ FAIL → back to apply step
    ▼
Step 6: test (haiku) ←─── Retry loop (max 2)
    ▼
Step 7: minimize (haiku)
    ▼
Step 8: report (haiku)
```

### /review — Multi-Check Code Review
```
Step 1: Initialize pipeline-state.md
    ▼
Step 2: Get changed files
    ▼
Step 3: Parallel review ─┬─ pattern-check (haiku)
                         ├─ security-check (sonnet)
                         ├─ perf-check (sonnet)
                         └─ ★ PLATFORM GUARD (haiku) ← Skip if no FE files
    ▼
Step 4: qa (opus)
    ▼
Step 5: report (haiku)
```

### /build-test — Build and Test
```
Step 1: Initialize pipeline-state.md
    ▼
Step 2: Backend build (haiku)
    │ FAIL → diagnostic
    ▼
Step 3: Backend tests (haiku)
    │ FAIL → diagnostic
    ▼
Step 4: Frontend build (haiku)
    │ FAIL → diagnostic
    ▼
Step 5: Frontend tests (haiku)
    │ FAIL → diagnostic
    ▼
Step 6: report (haiku)
```

### /pr — PR Description Prep
```
Analyze commits → Generate PR description → Suggest commands
(READ-ONLY — never executes git write commands)
```

### /commit-assist — Commit Message Prep
```
Analyze changes → Categorize → Generate commit message → Suggest commands
(READ-ONLY — never executes git write commands)
```

## Agent Registry

### Global Agents (Reusable)
| Agent | Model | Type | Purpose | Rationale |
|-------|-------|------|---------|-----------|
| branch-guard | haiku | general-purpose | Block protected branches | Simple git check |
| scout | haiku | Explore | Quick codebase scan | File search, no reasoning |
| spec | opus | general-purpose | Design specification | Deep architectural thinking |
| test | haiku | general-purpose | Run tests, parse output | Command execution + parsing |
| qa | opus | general-purpose | Quality assurance | Deep analysis of combined results |
| minimize | haiku | general-purpose | Reduce diff size | Mechanical diff review |
| report | haiku | general-purpose | Pipeline summary | Aggregation, no reasoning |
| diagnostic | sonnet | general-purpose | Error analysis | Moderate reasoning on errors |
| pattern-check | haiku | general-purpose | Convention enforcement | Pattern matching with ast-grep |
| security-check | sonnet | general-purpose | Security analysis | Requires vulnerability knowledge |
| perf-check | sonnet | general-purpose | Performance analysis | Requires perf pattern knowledge |
| platform-guard | haiku | general-purpose | Cross-platform compat (web+native) | Pattern matching with ast-grep |

### Layer-Specific Code Agents
| Agent | Model | Scope | Rationale |
|-------|-------|-------|-----------|
| backend-controller | sonnet | `modules/*/controller/` | Code writing |
| backend-service | sonnet | `modules/*/service/` | Business logic writing |
| backend-entity | sonnet | `modules/*/entity,dto,repository/` | Schema/entity design |
| backend-config | sonnet | `config/`, `security/`, `resources/` | Security/CORS/YAML logic |
| frontend-screen | sonnet | `features/*/Screen.js` | UI code writing |
| frontend-shared | sonnet | `components/`, `contexts/`, `hooks/`, `utils/` | Shared code, high impact |
| frontend-api | sonnet | `api/`, `features/*/*.api.js` | API integration |

### Infrastructure Agents
| Agent | Model | Scope |
|-------|-------|-------|
| db | sonnet | `init_db.sql`, entity alignment |

## Platform Guard Details

The **platform-guard** agent ensures every frontend change works on BOTH web and native. It runs:

### In Every Pipeline (after code changes, before test/minimize)
- `/implement` → Step 11
- `/investigate` → Step 5
- `/refactor` → Step 5
- `/review` → Step 3d (parallel with other checks)

### What It Checks
| Check | Detects | Severity |
|-------|---------|----------|
| CHECK 1: Web-Only APIs | `window.*`, `document.*`, `navigator.*` without guard | CRITICAL |
| CHECK 2: Native-Only APIs | `Alert.alert()`, `Haptics.*` without guard | CRITICAL |
| CHECK 3: File Pairs | `.web.js` without matching `.native.js` (or vice versa) | CRITICAL |
| CHECK 4: Library Imports | Platform-restricted libraries in universal code | CRITICAL |
| CHECK 5: Style Compat | Shadow/elevation without web fallback | WARNING |
| CHECK 6: Responsive | `window.innerWidth` without platform guard | WARNING |

### Scope Classification
- **UNIVERSAL** (default): Must work on web AND native
- **WEB-ONLY**: Explicitly scoped to web (won't check native compat)
- **NATIVE-ONLY**: Explicitly scoped to native (won't check web compat)

## MCP Servers (`.mcp.json`)

Available to all agents and skills via MCP protocol:

| Server | Type | Agent/Skill Usage |
|--------|------|-------------------|
| `postgres` | stdio | `/db-inspect` skill, diagnostic agent (DB errors) |
| `github` | http | security-check (vulnerability alerts), PR workflows |
| `memory` | stdio | Pipeline knowledge persistence across sessions |
| `fetch` | stdio | Documentation lookup, API reference fetching |
| `mobile-mcp` | stdio | `/ui-test` skill, `/visual-diff` skill (Android emulator) |
| `context7` | stdio | spec agent (up-to-date Expo/Spring/RN docs in prompts) |
| `playwright` | stdio | Web UI testing via accessibility snapshots |
| `sequential-thinking` | stdio | spec/qa agents (structured complex reasoning) |
| `sentry` | http | diagnostic agent (production error traces, breadcrumbs) |

## Skills (`.claude/skills/`)

Skills complement commands with advanced features (MCP tools, frontmatter, allowed-tools):

| Skill | MCP | Purpose |
|-------|-----|---------|
| `/ui-test` | mobile-mcp + playwright | Cross-platform visual testing (Android + web) |
| `/visual-diff` | mobile-mcp + playwright | Before/after comparison on both platforms |
| `/web-test` | playwright | Web-only browser testing via accessibility snapshots |
| `/db-inspect` | postgres | Database schema/data inspection |
| `/dependency-audit` | — | Maven + npm dependency audit |
| `/api-docs` | — | Generate API docs from controllers |

**Skills vs Commands:**
- **Commands** (`.claude/commands/`) = pipeline agents (orchestrators + sub-agents)
- **Skills** (`.claude/skills/`) = standalone tools with MCP integration

### MCP Integration Map (Agent → MCP)
Every agent now references the MCP servers it should use:

| Agent | MCP Servers Used |
|-------|-----------------|
| spec | context7, sequential-thinking |
| qa | context7, sequential-thinking |
| diagnostic | sentry, postgres, context7 |
| investigate (diagnose) | sentry, sequential-thinking, postgres, context7 |
| scout | fetch |
| test | playwright, context7 |
| report | memory |
| security-check | github, context7 |
| perf-check | postgres, sentry |
| pr | github, memory |
| commit-assist | github |
| backend-entity | context7, postgres |
| backend-service | context7 |
| backend-controller | context7 |
| backend-config | context7 |
| frontend-screen | context7 |
| frontend-shared | context7 |
| frontend-api | context7 |
| db | postgres |

## Shared Memory Pattern
All orchestrators use `.claude/pipeline-state.md` as shared memory:
- Created fresh at pipeline start
- Each agent reads context and appends results
- `/report` agent deletes it after producing final summary
- If it exceeds ~200 lines, agents summarize rather than append

## Git Safety
See `.claude/settings.json` for PreToolUse hooks that block:
- `git commit`, `git push`, `gh pr create`
- `git checkout -b`, `git branch -D`
- `git reset --hard`, `git push --force`

These commands are OUTPUT to the user to run manually.

## Retry Pattern
```
Test attempt 1 → FAIL → Fix → Test attempt 2 → FAIL → Fix → Test attempt 3 → FAIL → Diagnostic → STOP
```
Max 2 retries (3 total attempts) before calling diagnostic and stopping.
