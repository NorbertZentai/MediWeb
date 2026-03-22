# /spec - Create a specification/design document for a feature or change

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` for any existing context from scout.
2. Analyze the task requirements thoroughly:
   - What exactly needs to change?
   - What are the inputs and outputs?
   - What are the edge cases?
   - What are the security implications?
3. For backend changes, consider:
   - Which module(s) are affected?
   - Entity/DTO changes needed?
   - New or modified endpoints (HTTP method, path, request/response)?
   - Database schema changes (new columns, tables, constraints)?
   - Security rules (who can access what)?
   - Notification/email impacts?
4. For frontend changes, consider:
   - Which screen(s)/component(s) are affected?
   - Navigation changes?
   - State management impacts (Context updates)?
   - API integration (new/modified API calls)?
   - **Platform compatibility (CRITICAL)**:
     - Does this need to work on BOTH web AND native? (default: YES)
     - If using browser APIs (`window`, `document`) → needs `Platform.OS === 'web'` guard
     - If using `Alert.alert` → needs `window.confirm` fallback for web
     - If large platform difference → use `.web.js`/`.native.js` file variants
     - If modifying styles with shadows → needs `Platform.select` with `boxShadow` for web
     - Use existing wrappers: `utils/toast`, `utils/haptics`, `utils/storage`, `utils/notifications`
   - Theme/styling requirements?
5. Output a structured spec:
   ```
   ## Specification: [Title]
   ### Overview
   [1-2 sentence summary]
   ### Requirements
   - [ ] Requirement 1
   - [ ] Requirement 2
   ### Technical Design
   #### Backend Changes
   [Details]
   #### Frontend Changes
   [Details]
   #### Platform Compatibility
   - Scope: UNIVERSAL / WEB-ONLY / NATIVE-ONLY
   - Platform-specific concerns: [list any]
   - Wrappers needed: [list any]
   ### API Contract
   [Endpoint details if applicable]
   ### Database Changes
   [Schema changes if applicable]
   ### Edge Cases
   - Case 1: handling
   ### Out of Scope
   - Item 1
   ```
6. Update `.claude/pipeline-state.md` under `### Spec` with the specification.

## MCP Integration
- **context7**: Before designing, fetch up-to-date docs for relevant libraries. E.g., if the task involves Expo Router navigation, use context7 to fetch current Expo Router docs. If it involves Spring Security, fetch Spring Boot 3.4 security docs. This prevents designing against outdated or hallucinated APIs.
- **sequential-thinking**: For complex multi-layer features (backend + frontend + DB), use sequential-thinking to decompose the design step by step before writing the spec. This ensures dependencies between layers are correctly ordered.

## Rules
- This agent is READ-ONLY — produces documentation only, never modifies code
- Be precise about API contracts — include HTTP methods, paths, request/response bodies
- Always consider both web and mobile platform differences for frontend
- Flag any breaking changes explicitly
