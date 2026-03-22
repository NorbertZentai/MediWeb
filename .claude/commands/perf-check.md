# /perf-check - Performance analysis of changed files

## Task
$ARGUMENTS

## Steps

1. Get changed files: `git diff --name-only --diff-filter=ACMR HEAD`
2. For each changed **backend file**, check:
   - **N+1 queries**: Loops calling repository methods (use `@EntityGraph` or `JOIN FETCH`)
   - **Missing pagination**: `findAll()` without `Pageable` on large tables
   - **Eager fetching**: `FetchType.EAGER` on collections
   - **Missing indexes**: New queries on columns without apparent indexes
   - **Blocking calls**: `Thread.sleep()`, synchronous HTTP in `@Scheduled` methods
   - **Connection leaks**: Manual `DataSource.getConnection()` without try-with-resources
   - Use ast-grep:
     ```bash
     ast-grep --pattern 'for ($ITEM : $LIST) { $$$REPO.find$METHOD($$$); }' --lang java file.java
     ```
3. For each changed **frontend file**, check:
   - **Unnecessary re-renders**: Missing `useMemo`/`useCallback` on expensive computations
   - **Large list rendering**: FlatList without `keyExtractor`, `getItemLayout`, or `windowSize`
   - **Image optimization**: Missing image resizing/caching
   - **Bundle size**: Large library imports that could be tree-shaken
   - **Memory leaks**: Missing cleanup in useEffect, event listeners not removed
   - **Synchronous storage**: `AsyncStorage` called in render path
4. Output structured report:
   ```
   ## Performance Check Report
   ### Critical (will cause visible issues)
   - [file:line] Description + suggested fix
   ### Warning (potential issue at scale)
   - [file:line] Description + suggested fix
   ### Verdict: PASS / WARN / FAIL
   ```
5. Update `.claude/pipeline-state.md` under `### Performance Check`.

## MCP Integration
- **postgres**: For backend perf issues, query the database for missing indexes and table statistics: `SELECT relname, seq_scan, idx_scan, n_live_tup FROM pg_stat_user_tables WHERE seq_scan > idx_scan AND n_live_tup > 100`. This reveals actual sequential scan hotspots, not just theoretical N+1 patterns.
- **sentry**: Check Sentry for existing performance monitoring data — slow transactions, high-latency endpoints, and frontend vitals. This grounds the analysis in real production data rather than code-only heuristics.

## Rules
- READ-ONLY — report only, never fix
- Only check changed files
- Critical = user-visible performance degradation
- Warning = potential issue at scale
