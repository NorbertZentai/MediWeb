# /pattern-check - Convention and naming enforcement

## Task
$ARGUMENTS

## Steps

1. Get changed files: `git diff --name-only --diff-filter=ACMR HEAD`
2. For each changed **backend Java file**, check:
   - **Naming**: Controllers end with `Controller`, Services with `Service`, Repos with `Repository`, DTOs with `DTO`, Entities have `@Entity`
   - **Package placement**: Controllers in `controller/`, services in `service/`, etc.
   - **Annotations**: Controllers have `@RestController` + `@RequestMapping`, Services have `@Service`, Repos have `@Repository`
   - **Lombok usage**: Prefer `@RequiredArgsConstructor` over `@Autowired` field injection (mixed in project, flag but don't fail)
   - **DTO pattern**: Entities should not be exposed directly in controller responses — use DTOs
   - **Module boundaries**: Code in `modules/X/` should not import from `modules/Y/` internal packages (only through service interfaces)
   - Use ast-grep for structural checks:
     ```bash
     ast-grep --pattern 'class $NAME { @Autowired private $TYPE $FIELD; }' --lang java path/to/file.java
     ```
3. For each changed **frontend JS/TS file**, check:
   - **Feature structure**: Each feature has `Screen.js`, `*.style.js`, `*.api.js`, and `*Service.js`
   - **Naming**: Screens end with `Screen`, styles use `createStyles(theme)` pattern
   - **Imports**: Features should import from `contexts/`, `components/`, `utils/`, `api/` — not directly from other features
   - **Platform handling**: Platform-specific code uses `.native.js` / `.web.js` suffixes or `Platform.select()`
   - **Theme usage**: Styles should use `theme` object, not hardcoded colors
4. Output structured report:
   ```
   ## Pattern Check Report
   ### Violations
   - [file:line] [RULE] Description
   ### Warnings
   - [file:line] [RULE] Description
   ### Compliant: [count] files
   ### Verdict: PASS / WARN / FAIL
   ```
5. Update `.claude/pipeline-state.md` under `### Pattern Check`.

## Rules
- READ-ONLY — report only, never fix
- Only check changed files (git diff --name-only)
- FAIL only on critical violations (wrong package, broken layering)
- WARN on style issues (Autowired vs constructor injection)
