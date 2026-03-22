# /security-check - Security analysis of changed files

## Task
$ARGUMENTS

## Steps

1. Get changed files: `git diff --name-only --diff-filter=ACMR HEAD`
2. For each changed **backend file**, check:
   - **SQL Injection**: String concatenation in queries (use `@Query` with params or JPA Criteria)
   - **Auth bypass**: Endpoints missing `@PreAuthorize` or security config exclusion
   - **Secret exposure**: Hardcoded passwords, API keys, JWT secrets in code (should be in env/config)
   - **CORS**: Overly permissive CORS settings (`*` origins)
   - **Input validation**: Missing `@Valid`, `@NotNull`, `@Size` on request bodies
   - **Mass assignment**: Accepting entity objects directly from request (should use DTOs)
   - **Path traversal**: File operations with user-supplied paths
   - Use ast-grep:
     ```bash
     ast-grep --pattern '$QUERY + $VAR' --lang java file.java
     ```
3. For each changed **frontend file**, check:
   - **XSS**: Rendering user input without sanitization (`dangerouslySetInnerHTML` or equivalent)
   - **Token storage**: JWT tokens stored insecurely (should use SecureStore on mobile, httpOnly cookies on web)
   - **API keys in code**: Hardcoded API endpoints or keys in source
   - **Deep linking**: Unvalidated deep link parameters
4. Check for leaked secrets:
   ```bash
   git diff HEAD | grep -iE '(password|secret|api.key|token)\s*[:=]' | grep -v 'test\|mock\|example'
   ```
5. Output structured report:
   ```
   ## Security Check Report
   ### Critical
   - [file:line] [VULN-TYPE] Description
   ### High
   - [file:line] [VULN-TYPE] Description
   ### Medium
   - [file:line] [VULN-TYPE] Description
   ### Verdict: PASS / FAIL
   ```
6. Update `.claude/pipeline-state.md` under `### Security Check`.

## MCP Integration
- **github**: Check GitHub security advisories and Dependabot alerts for known vulnerabilities in project dependencies. Use: "List open security advisories for this repository".
- **context7**: When evaluating whether a security pattern is correct (e.g., Spring Security filter chain, JWT validation), fetch current docs to confirm the recommended secure implementation.

## Rules
- READ-ONLY — report only, never fix
- Only check changed files
- Any CRITICAL finding = FAIL verdict
- Be specific about the vulnerability and remediation
