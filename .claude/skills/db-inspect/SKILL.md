---
name: db-inspect
description: Inspect PostgreSQL database — schema, data, queries, health checks
allowed-tools: MCPTool(postgres:*), Read, Bash(psql *)
---

# /db-inspect — Database Inspection

## Task
$ARGUMENTS

## What This Skill Does
Connects to the MediWeb PostgreSQL database via the postgres MCP server to inspect schema, data, and diagnose database issues.

## Steps

### Step 1: Connect & Verify
- Use postgres MCP to run: `SELECT version();`
- Confirm connection to the correct database
- If connection fails, check if PostgreSQL is running: `pg_isready -h localhost -p 5432`

### Step 2: Execute Inspection
Based on $ARGUMENTS:

#### Schema Inspection (default if no specific task given)
```sql
-- List all tables with row counts
SELECT schemaname, tablename, n_live_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Show table structure
\d+ table_name
```

#### Entity Alignment Check
- Read `init_db.sql` for expected schema
- Query actual database schema via MCP
- Compare columns, types, constraints, indexes
- Report mismatches between JPA entities and DB schema

#### Query Performance
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC LIMIT 10;

-- Check missing indexes
SELECT relname, seq_scan, idx_scan
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan AND n_live_tup > 1000;
```

#### Data Inspection
- Query specific tables as requested
- Show sample data (LIMIT 10)
- Check for NULL values, duplicates, orphaned records

### Step 3: Report
```
## Database Inspection Report
### Connection: [host:port/database]
### Findings:
- [finding 1]
- [finding 2]
### Recommendations:
- [recommendation]
### Queries Used:
- [list SQL queries for reproducibility]
```

## Rules
- NEVER run INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE — this is READ-ONLY
- Always LIMIT query results to prevent huge output
- Use `init_db.sql` as the source of truth for expected schema
- Report findings in a structured format
- If $ARGUMENTS is empty, run a general health check (tables, sizes, connections)
