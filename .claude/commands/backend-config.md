# /backend-config - Configuration and Security agent

## Task
$ARGUMENTS

## Scope
- **Directories**:
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/config/`
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/security/`
  - `MediWeb_Backend/src/main/resources/`
  - Root: `docker-compose.*.yml`, `.env*`, `render.yaml`

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. For **Spring config changes**:
   - Use `yq` to query YAML without full file reads:
     ```bash
     yq '.spring.datasource' MediWeb_Backend/src/main/resources/application-dev.yml
     ```
   - Config hierarchy: `application.yml` (base) -> `application-dev.yml` (dev overrides)
   - Use env variables with defaults: `${VAR:default}`
3. For **Security config changes**:
   - Security filter chain in config package
   - JWT authentication filter
   - CORS configuration
   - Endpoint authorization rules
4. For **pom.xml changes**:
   - Use `xmlstarlet` to query:
     ```bash
     xmlstarlet sel -t -v '//dependency[artifactId="spring-boot-starter-web"]/version' MediWeb_Backend/pom.xml
     ```
   - Add dependencies following existing format
5. For **Docker changes**:
   - `docker-compose.dev.yml` for local development
   - `docker-compose.prod.yml` for production
   - Check `render.yaml` for deployment config
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### Config Changes`.

## MCP Integration
- **context7**: For Spring Security config changes (SecurityFilterChain, CORS, OAuth2), ALWAYS fetch current Spring Security 6.x docs via context7. Spring Security APIs change frequently between versions — hallucinating deprecated methods is a common and dangerous error.

## Rules
- NEVER hardcode secrets — always use environment variables
- NEVER change production config without explicit instruction
- Prefer `application-dev.yml` for dev-only settings
- When adding new env vars, document them in `.env.development`
- Test YAML syntax: `yq '.' file.yml > /dev/null` after editing
