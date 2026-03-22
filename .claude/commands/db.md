# /db - Database schema and migration agent

## Task
$ARGUMENTS

## Scope
- **Files**:
  - `init_db.sql` — master schema definition
  - `MediWeb_Backend/src/main/java/hu/project/MediWeb/modules/*/entity/*.java` — JPA entities
  - `MediWeb_Backend/src/main/resources/application-dev.yml` — DB connection config

## Steps

1. Read `.claude/pipeline-state.md` for context.
2. Understand the current schema by reading `init_db.sql`.
3. For **schema changes**:
   - Add new table or column to `init_db.sql`
   - Follow existing conventions:
     - Table names: lowercase, underscored (`profile_medications`)
     - Primary key: `id SERIAL PRIMARY KEY`
     - Foreign keys: `REFERENCES public.table(id)` with appropriate `ON DELETE`
     - Timestamps: `TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
     - Unique constraints: `CONSTRAINT name UNIQUE (col1, col2)`
   - Spring Data JPA uses `spring.jpa.hibernate.ddl-auto` — check if set to `update` or `validate`
4. For **entity alignment**:
   - Ensure JPA entity annotations match `init_db.sql` schema
   - `@Table(name = "table_name")` must match SQL table name
   - `@Column(name = "col_name")` for non-matching Java field names
   - `@JoinColumn(name = "fk_column")` for relationships
5. For **data queries**:
   - Use `yq` to check DB config: `yq '.spring.datasource' MediWeb_Backend/src/main/resources/application-dev.yml`
   - Check JPA config: `yq '.spring.jpa' MediWeb_Backend/src/main/resources/application-dev.yml`
6. Apply changes using the Edit tool.
7. Update `.claude/pipeline-state.md` under `### Database Changes`.

## MCP Integration
- **postgres**: Query the actual database to verify current schema before making changes. Examples:
  - List tables: `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
  - Inspect columns: `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'table_name'`
  - Check constraints: `SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'table_name'::regclass`
  - Check indexes: `SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'table_name'`
  This ensures `init_db.sql` changes align with the actual database state.

## Rules
- ALWAYS update both `init_db.sql` AND the corresponding JPA entity together
- NEVER drop tables or columns without explicit instruction
- Use ON DELETE CASCADE only where parent-child relationship is clear
- PostgreSQL 15 syntax — use standard SQL types
- Document any data migration needed in pipeline state
