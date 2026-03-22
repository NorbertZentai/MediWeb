# MediWeb — Claude Code Configuration

## Project Overview
MediWeb is a medication tracking web/mobile application (Hungarian: "gyógyszer-kezelő").
- **Backend**: Java 17, Spring Boot 3.4.1, Maven, PostgreSQL 15, JWT auth
- **Frontend**: JavaScript/TypeScript, Expo SDK 54, React Native 0.81, Expo Router
- **Deployment**: Docker + Render.com
- **Monorepo**: `MediWeb_Backend/` and `MediWeb_Frontend/` in the same git repo

## CLI Tools

| Tool | Path | Usage |
|------|------|-------|
| yq | /opt/homebrew/bin/yq | `yq '.spring.datasource' application-dev.yml` |
| jq | /usr/bin/jq | `jq '.dependencies' package.json` |
| fd | /opt/homebrew/bin/fd | `fd -t f 'Controller.java' MediWeb_Backend/src` |
| fzf | /opt/homebrew/bin/fzf | Interactive file selection |
| ast-grep | /opt/homebrew/bin/ast-grep | `ast-grep --pattern '@Service class $NAME' --lang java` |
| xmlstarlet | /opt/homebrew/bin/xmlstarlet | `xmlstarlet sel -N pom=http://maven.apache.org/POM/4.0.0 -t -v '//pom:dependency/pom:artifactId' pom.xml` |
| tokei | /opt/homebrew/bin/tokei | `tokei MediWeb_Backend/src` |
| difft | /opt/homebrew/bin/difft | `difft file1.java file2.java` |

## Build Commands

### Backend
```bash
cd MediWeb_Backend
./mvnw compile -q          # Compile (quiet)
./mvnw test                # Run tests
./mvnw spring-boot:run     # Run app (needs PostgreSQL)
```

### Frontend
```bash
cd MediWeb_Frontend
npm start                  # Start Expo dev server (web)
npx expo export --platform web  # Build for web
npx jest --passWithNoTests      # Run tests
```

## Token Optimization Rules

1. **Search-First**: Use `Grep`/`Glob`/`fd` before `Read`. Never read files speculatively.
2. **Diff-First**: Use `git diff` for reviews instead of reading full files.
3. **Config Query Tools**: Use `yq` for YAML, `jq` for JSON, `xmlstarlet` for XML instead of reading config files fully.
4. **Build Output**: Run builds with `-q` (quiet) flag. Pipe through `tail -30`. Never paste full build logs.
5. **Read Efficiency**: Use `offset` + `limit` parameters for reading specific line ranges.
6. **Changed Files Only**: Use `git diff --name-only --diff-filter=ACMR` for scoped analysis. Never analyze entire codebase.
7. **Pipeline State**: Downstream agents read context from `.claude/pipeline-state.md` instead of re-scanning.
8. **Scout Once**: Scout identifies files once; all subsequent agents use that list.

## Architecture

### Backend (Spring Boot — Modular)
```
MediWeb_Backend/src/main/java/hu/project/MediWeb/
├── config/          # Spring config (CORS, WebClient, etc.)
├── security/        # JWT filter, SecurityConfig
└── modules/
    ├── dashboard/   # Admin dashboard
    ├── favorite/    # User favorites
    ├── GoogleImage/ # Google image search integration
    ├── log/         # Intake logging
    ├── medication/  # Medications + sync with external DB
    ├── notification/# Email + push notifications
    ├── profile/     # User profiles (family members)
    ├── review/      # Medication reviews
    ├── search/      # Medication search (OGYÉI)
    ├── statistic/   # Usage statistics
    └── user/        # User management + auth
```

Each module follows: `controller/ → service/ → repository/ → entity/ → dto/`

### Frontend (Expo — Feature-based)
```
MediWeb_Frontend/src/
├── api/            # Axios client with JWT interceptor
├── assets/         # Images, fonts
├── components/     # Shared UI components
│   └── ui/         # Base UI primitives
├── contexts/       # AuthContext, ThemeContext
├── features/       # Feature modules
│   ├── auth/       # Login, Register screens
│   ├── favorites/  # Favorites screen
│   ├── home/       # Home screen
│   ├── medication/ # Medication detail screen
│   ├── profile/    # Profile + settings + intake
│   ├── review/     # Review section
│   ├── search/     # Search + filters
│   └── settings/   # App settings
├── hooks/          # Custom React hooks
├── styles/         # Theme system (theme.js, Colors.ts)
└── utils/          # Utilities (toast, haptics, storage, notifications)
```

Each feature follows: `Screen.js` + `Screen.style.js` + `feature.api.js` + `FeatureService.js`

## Coding Conventions

### Backend (Java)
- **Annotations**: `@RestController` + `@RequestMapping` for controllers, `@Service` for services, `@Repository` for repos
- **Dependency Injection**: Mixed `@Autowired` field injection and `@RequiredArgsConstructor` constructor injection
- **Lombok**: `@Data`, `@Builder`, `@RequiredArgsConstructor`, `@Slf4j` used extensively
- **DTOs**: Always use DTOs for API responses — never expose JPA entities directly
- **Naming**: PascalCase classes, camelCase methods, `*Controller`, `*Service`, `*Repository`, `*DTO`
- **Logging**: Hungarian + English mixed log messages with `@Slf4j`

### Frontend (JavaScript/TypeScript)
- **Components**: Functional components with hooks, `export default function ScreenName()`
- **Styles**: `createStyles(theme)` pattern returning `StyleSheet.create()`
- **Theme**: Always use `theme.colors.*` — no hardcoded colors
- **Platform**: `.native.js`/`.web.js` suffixes OR `Platform.select()` for platform-specific code
- **State**: React Context for global state (AuthContext, ThemeContext)
- **Navigation**: Expo Router with file-based routing
- **API**: Axios via central `apiClient.js` with JWT interceptor
- **Language**: Hungarian UI labels, English code

## Cross-Platform Rules (CRITICAL)

MediWeb runs on **web** (react-native-web) AND **native** (Android/iOS via Expo Go). All frontend code MUST work on both platforms unless explicitly scoped.

### Platform Wrappers (ALWAYS use these instead of direct imports)
| Concern | Use This Wrapper | NEVER Use Directly |
|---------|-----------------|-------------------|
| Toast | `utils/toast` | `react-toastify`, `react-native-toast-message` |
| Haptics | `utils/haptics` | `expo-haptics` |
| Storage | `utils/storage` | `localStorage`, `AsyncStorage` |
| Notifications | `utils/notifications` | `expo-notifications` |

### Platform-Specific Patterns
| Pattern | When to Use |
|---------|-------------|
| `.web.js` / `.native.js` file variants | Large platform differences (e.g., toast, dropdown) |
| `Platform.OS === 'web'` guard | Small inline differences (e.g., `window.confirm` vs `Alert.alert`) |
| `Platform.select({ web: ..., default: ... })` | Style differences (e.g., shadows) |

### Forbidden in Universal Code (without platform guard)
- `window.*`, `document.*`, `navigator.*`, `localStorage.*` — web-only APIs
- `Alert.alert()` — silently fails on web, must have `window.confirm` fallback
- Direct `expo-haptics` — no-op on web, use wrapper
- `shadowColor`/`elevation` without `boxShadow` web fallback

### Scope Classification
- **UNIVERSAL** (default): Must work on web AND native
- **WEB-ONLY**: Bug/feature explicitly for web (e.g., "fix dropdown on web")
- **NATIVE-ONLY**: Bug/feature explicitly for native (e.g., "fix Android notification")
- Platform-specific fixes should NEVER break the other platform

## Git Workflow
- **Protected branches**: `master`, `develop`, `release`
- **Feature branches**: `feature/description`
- **Commit style**: Conventional commits — `type(scope): description`

## MCP Servers

Configured in `.mcp.json` (project root). Available to all agents and skills.

| MCP Server | Purpose | Tools Provided |
|------------|---------|---------------|
| `postgres` | Direct DB inspection (schema, queries, health) | SQL query execution |
| `github` | PR/issue management, code review | GitHub API access |
| `memory` | Persistent knowledge graph across sessions | Store/retrieve knowledge |
| `fetch` | Web content fetching and conversion | URL fetch + markdown conversion |
| `mobile-mcp` | Android emulator control (screenshots, tap, swipe) | Device management, UI automation |
| `context7` | Up-to-date library docs injected into prompts | Documentation fetching (Expo, Spring, RN) |
| `playwright` | Browser automation via accessibility snapshots | Web testing, form filling, navigation |
| `sequential-thinking` | Structured reasoning for complex problems | Step-by-step problem decomposition |
| `sentry` | Error monitoring — stack traces, breadcrumbs | Issue search, error diagnosis, release tracking |

### MCP Setup
- Authenticate GitHub: run `/mcp` inside Claude Code session
- Authenticate Sentry: run `/mcp` → OAuth login with Sentry org
- PostgreSQL: update `POSTGRES_URL` in `.mcp.json` with actual credentials
- mobile-mcp: requires running Android emulator + ADB (`/opt/homebrew/bin/adb`)
- context7: works immediately, optional API key for higher rate limits (context7.com/dashboard)

## Skills

Skills in `.claude/skills/` provide advanced slash commands with MCP integration and frontmatter.

| Skill | Command | MCP Used | Purpose |
|-------|---------|----------|---------|
| ui-test | `/ui-test` | mobile-mcp + playwright | Cross-platform visual UI testing (Android + web) |
| visual-diff | `/visual-diff` | mobile-mcp + playwright | Before/after comparison on both platforms |
| web-test | `/web-test` | playwright | Web-only browser UI testing via accessibility snapshots |
| db-inspect | `/db-inspect` | postgres | Database schema/data inspection (READ-ONLY) |
| dependency-audit | `/dependency-audit` | — | Audit Maven + npm dependencies |
| api-docs | `/api-docs` | — | Generate API documentation from controllers |

### MCP Integration in Agents
All 9 MCP servers are wired into the agent commands:

| MCP Server | Integrated Into |
|------------|----------------|
| `context7` | spec, qa, diagnostic, all 7 code agents (BE+FE) |
| `sequential-thinking` | spec, qa, investigate (diagnose step) |
| `sentry` | diagnostic, investigate (diagnose step), perf-check |
| `playwright` | test, ui-test skill, visual-diff skill, web-test skill |
| `postgres` | db, diagnostic, backend-entity, perf-check |
| `github` | security-check, pr, commit-assist |
| `memory` | report |
| `fetch` | scout |
| `mobile-mcp` | ui-test skill, visual-diff skill |

## Agent System
See `.claude/agent-structure.md` for full agent hierarchy and pipeline documentation.
