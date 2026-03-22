# /test - Write and run tests

## Task
$ARGUMENTS

## Steps

1. Read `.claude/pipeline-state.md` for context on what was changed.
2. Determine test scope:
   - **Backend (Java/Spring Boot)**:
     - Test location: `MediWeb_Backend/src/test/java/hu/project/MediWeb/`
     - Framework: JUnit 5 + Spring Boot Test + Spring Security Test
     - Run single test: `cd MediWeb_Backend && ./mvnw test -pl . -Dtest=ClassName`
     - Run all tests: `cd MediWeb_Backend && ./mvnw test`
   - **Frontend (Expo/React Native)**:
     - Test location: `MediWeb_Frontend/__tests__/` or co-located `*.test.js`
     - Framework: Jest + jest-expo
     - Run tests: `cd MediWeb_Frontend && npx jest`
     - Run single test: `cd MediWeb_Frontend && npx jest --testPathPattern=pattern`
3. For backend test writing:
   - Use `@SpringBootTest` for integration tests
   - Use `@WebMvcTest` for controller tests
   - Use `@DataJpaTest` for repository tests
   - Mock external services (Google API, email)
   - Follow existing patterns in `MediWebApplicationTests.java`
4. For frontend test writing:
   - Use `jest-expo` preset
   - Test hooks with `renderHook`
   - Test components with `@testing-library/react-native` if available
   - Mock API calls with `jest.mock`
   - Mock navigation with `jest.mock('expo-router')`
5. Write test files following project conventions.
6. Run tests and capture output.
7. If tests FAIL:
   - Parse the failure output
   - Identify root cause
   - Output a structured failure report:
     ```
     ## Test Failure
     ### Failed Test: [name]
     ### Error: [message]
     ### Root Cause: [analysis]
     ### Suggested Fix: [what to change]
     ```
8. If tests PASS:
   - Output: `## Tests PASSED: [count] tests in [time]`
9. Update `.claude/pipeline-state.md` under `### Test Results`.

## MCP Integration
- **playwright**: For frontend changes affecting web UI, run a quick smoke test via playwright MCP after the build succeeds. Use playwright to navigate to the affected screen on `http://localhost:8081` (Expo web dev server) and verify the page renders without errors. This catches runtime crashes that compile-time checks miss.
- **context7**: When writing tests that use Spring Boot Test annotations or jest-expo APIs, fetch current docs via context7 to ensure correct test setup.

## Rules
- Run tests with `tail` piping for large outputs: `./mvnw test 2>&1 | tail -50`
- Never modify production code — only create/modify test files
- If build fails before tests, report build error separately
- Max 3 test files per run to keep scope manageable
