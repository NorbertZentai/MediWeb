# /diagnostic - Error analysis on pipeline failure

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` for full pipeline context.
2. Identify the failing step and its error output.
3. Analyze the error:
   - **Build error**: Parse compiler/bundler output for root cause
   - **Test error**: Parse test framework output for assertion failures
   - **Runtime error**: Analyze stack traces
   - **Config error**: Check YAML/properties syntax, missing env vars
4. For backend errors:
   - Check `MediWeb_Backend/src/main/resources/application-dev.yml` for config issues
   - Use `xmlstarlet sel -t -v '//dependency/artifactId' MediWeb_Backend/pom.xml` to verify dependencies
   - Check for missing Lombok annotations, JPA mapping issues
5. For frontend errors:
   - Check `MediWeb_Frontend/package.json` for dependency conflicts
   - Check for platform-specific issues (web vs native)
   - Verify Expo SDK compatibility
6. Output structured diagnostic:
   ```
   ## Diagnostic Report
   ### Failed Step: [step name]
   ### Error Type: [build/test/runtime/config]
   ### Error Message
   [exact error]
   ### Root Cause Analysis
   [detailed analysis]
   ### Recommended Fix
   1. [Step-by-step fix instructions]
   ### Prevention
   - [How to prevent this in the future]
   ```
7. Update `.claude/pipeline-state.md` under `### Diagnostic`.

## MCP Integration
- **sentry**: If the error might be a production bug, check Sentry for related issues, stack traces, and breadcrumbs. Use: "Search Sentry for issues matching [error message or class name]". This provides environment context, frequency, and user impact data.
- **postgres**: For DB-related errors (JPA mapping, SQL syntax, constraint violations), query the actual database schema via postgres MCP to compare against JPA entity definitions. Use: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'table_name'`.
- **context7**: For dependency/version mismatch errors, fetch current docs for the failing library to check if the API has changed or been deprecated.

## Rules
- READ-ONLY — diagnose only, never fix
- Always include the exact error message for traceability
- Provide actionable fix instructions, not vague suggestions
- Consider both immediate fix and root cause
