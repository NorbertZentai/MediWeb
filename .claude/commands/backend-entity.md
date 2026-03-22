# /backend-entity - Entity, DTO, and Repository layer agent

## Task
$ARGUMENTS

## Scope
- **Directories**:
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/entity/`
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/dto/`
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/repository/`
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/enums/`
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/exception/`

## Steps

1. Read `.claude/pipeline-state.md` for context (scout results, spec).
2. For **entities**:
   - Annotations: `@Entity`, `@Table(name = "table_name")`, `@Data` or `@Getter/@Setter`
   - Use `@Id @GeneratedValue(strategy = GenerationType.IDENTITY)` for primary keys
   - Use `@Column` for non-standard column mappings
   - Relationships: `@ManyToOne`, `@OneToMany(cascade = ...)`, `@JoinColumn`
   - Reference `init_db.sql` for schema — entities must match the DB schema
3. For **DTOs**:
   - Use Lombok: `@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
   - DTOs should only contain fields needed by the API response
   - No JPA annotations on DTOs
4. For **repositories**:
   - Extend `JpaRepository<Entity, Long>` (or Integer for legacy)
   - Use `@Query` for custom queries with named parameters
   - Use projections for read-only queries (see `repository/projection/` dirs)
5. For **exceptions**:
   - Follow `DuplicateAssignmentException` pattern
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### Entity/DTO Changes`.

## MCP Integration
- **context7**: When using JPA annotations you're unsure about (e.g., `@EntityGraph`, `@NamedQuery`, `@MappedSuperclass`), fetch current Spring Data JPA / Hibernate docs via context7 to verify correct syntax and behavior.
- **postgres**: When aligning entities with DB schema, query the actual database via postgres MCP to verify current column types, constraints, and indexes: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'table_name'`.

## Rules
- ONLY modify entity, dto, repository, enum, and exception files
- NEVER modify controllers or services
- Entities MUST match `init_db.sql` schema
- Always update `init_db.sql` if adding new tables/columns
- Use `@Builder` for DTOs to enable clean construction
