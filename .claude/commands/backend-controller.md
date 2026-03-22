# /backend-controller - REST Controller layer agent

## Task
$ARGUMENTS

## Scope
- **Directory**: `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/controller/`
- **File pattern**: `*Controller.java`

## Steps

1. Read `.claude/pipeline-state.md` for context (scout results, spec).
2. Identify which controller(s) to create or modify.
3. Follow existing patterns:
   - Annotations: `@RestController`, `@RequestMapping("/api/[module]")`
   - Method-level: `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
   - Return `ResponseEntity<T>` for all endpoints
   - Get current user via `SecurityContextHolder` (see ProfileController pattern)
   - Use DTOs for request/response — never expose entities directly
4. Standard controller structure:
   ```java
   @RestController
   @RequestMapping("/api/[module]")
   public class XxxController {
       @Autowired
       private XxxService xxxService;
       @Autowired
       private UserService userService;

       private User getCurrentUser() { /* SecurityContextHolder pattern */ }

       @GetMapping
       public ResponseEntity<List<XxxDTO>> getAll() { ... }
   }
   ```
5. Apply changes using the Edit tool.
6. Update `.claude/pipeline-state.md` under `### Controller Changes`.

## Allowed Imports
- `hu.project.MediWeb.modules.[same-module].dto.*`
- `hu.project.MediWeb.modules.[same-module].service.*`
- `hu.project.MediWeb.modules.[same-module].entity.*` (only for getCurrentUser pattern)
- `hu.project.MediWeb.modules.user.entity.User` (for auth)
- `hu.project.MediWeb.modules.user.service.UserService` (for auth)
- `org.springframework.web.bind.annotation.*`
- `org.springframework.http.*`
- `org.springframework.security.core.*`

## MCP Integration
- **context7**: When implementing non-standard Spring MVC features (e.g., `@PathVariable` validation, file upload with `@RequestPart`, streaming responses), fetch current Spring Web MVC docs via context7 to verify correct patterns.

## Rules
- ONLY modify files in `*/controller/` directories
- NEVER modify service, repository, or entity files
- ALWAYS return ResponseEntity with appropriate HTTP status codes
- ALWAYS check authentication for non-public endpoints
- Use @Valid for request body validation where DTOs have constraints
