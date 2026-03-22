# /backend-service - Business logic / Service layer agent

## Task
$ARGUMENTS

## Scope
- **Directory**: `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/service/`
- **File pattern**: `*Service.java`

## Steps

1. Read `.claude/pipeline-state.md` for context (scout results, spec).
2. Identify which service(s) to create or modify.
3. Follow existing patterns:
   - Annotations: `@Service` (some use `@RequiredArgsConstructor` with Lombok, some use `@Autowired`)
   - Use `@Transactional` for write operations
   - Use `@Slf4j` (Lombok) for logging
   - Repository injection via constructor or `@Autowired`
4. Standard service structure:
   ```java
   @Service
   @RequiredArgsConstructor
   @Slf4j
   public class XxxService {
       private final XxxRepository xxxRepository;

       public List<XxxDTO> findAll() { ... }
       public XxxDTO findById(Long id) { ... }

       @Transactional
       public XxxDTO save(Xxx entity) { ... }
   }
   ```
5. For DTO mapping:
   - Map entities to DTOs in service layer
   - Use builder pattern (Lombok `@Builder`) for DTOs
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### Service Changes`.

## Allowed Imports
- `hu.project.MediWeb.modules.[same-module].*` (all sub-packages)
- `hu.project.MediWeb.modules.user.entity.User` (for user-related operations)
- `hu.project.MediWeb.modules.user.service.UserService` (cross-module service calls)
- Spring framework imports
- Lombok imports

## MCP Integration
- **context7**: When implementing complex Spring features (e.g., `@Async`, `@Scheduled`, `@Cacheable`, `@EventListener`), fetch current Spring Boot 3.4 docs via context7 to ensure correct configuration and usage.

## Rules
- ONLY modify files in `*/service/` directories
- NEVER modify controller or repository interfaces
- Business logic belongs HERE — controllers should be thin
- Use @Transactional for all write operations
- Convert entities to DTOs before returning
