---
name: api-docs
description: Generate API documentation from backend controllers — endpoints, DTOs, auth rules
allowed-tools: Read, Grep, Glob, Bash(ast-grep *)
---

# /api-docs — API Documentation Generator

## Task
$ARGUMENTS

## Steps

### Step 1: Scope
- If $ARGUMENTS specifies a module (e.g., `medication`), scope to that module
- If empty, generate docs for ALL modules

### Step 2: Discover Endpoints
For each controller in scope:
```bash
# Find all controllers
fd -t f 'Controller.java' MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/

# Extract endpoint mappings
ast-grep --pattern '@$METHOD($$$)' --lang java [controller_file]
```

Read each controller and extract:
- Class-level `@RequestMapping` base path
- Method-level `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`, `@PatchMapping`
- Request parameters: `@RequestParam`, `@PathVariable`, `@RequestBody`
- Response type from `ResponseEntity<T>`
- Auth requirements from `@PreAuthorize` or `SecurityContextHolder` usage

### Step 3: Document DTOs
For each DTO referenced by endpoints:
- Read the DTO class
- List all fields with types
- Note any validation annotations (`@NotNull`, `@Size`, etc.)

### Step 4: Generate Documentation
Output structured API docs:
```
## MediWeb API Documentation

### Module: [name]
Base path: `/api/[module]`

#### [METHOD] /api/[module]/[path]
- **Auth**: Required / Public
- **Request Body**:
  ```json
  { "field": "type" }
  ```
- **Response** (200):
  ```json
  { "field": "type" }
  ```
- **Error Responses**: 400, 401, 403, 404, 500
```

### Step 5: Cross-Reference
- Verify frontend API calls match backend endpoints
- Check for unused endpoints (no frontend caller)
- Check for missing endpoints (frontend calls non-existent endpoint)

## Rules
- This is READ-ONLY — never modify code
- Use ast-grep for reliable annotation parsing
- Include authentication requirements for every endpoint
- Note which endpoints are used by frontend and which are orphaned
- Output in Markdown format suitable for project documentation
