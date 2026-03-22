---
name: dependency-audit
description: Audit project dependencies — outdated packages, vulnerabilities, compatibility
allowed-tools: Bash(npm *), Bash(npx *), Bash(./mvnw *), Bash(xmlstarlet *), Bash(jq *), Read
---

# /dependency-audit — Dependency Audit

## Task
$ARGUMENTS

## Steps

### Step 1: Scope
Determine audit scope from $ARGUMENTS:
- `backend` — Maven dependencies only
- `frontend` — npm dependencies only
- (empty) — Both

### Step 2: Backend Audit (if applicable)
```bash
# List all dependencies with versions
cd MediWeb_Backend && xmlstarlet sel -N pom=http://maven.apache.org/POM/4.0.0 \
  -t -m '//pom:dependency' \
  -v 'concat(pom:groupId, ":", pom:artifactId, ":", pom:version)' -n pom.xml

# Check for dependency updates
./mvnw versions:display-dependency-updates -q 2>&1 | tail -50

# Check for plugin updates
./mvnw versions:display-plugin-updates -q 2>&1 | tail -30
```

### Step 3: Frontend Audit (if applicable)
```bash
cd MediWeb_Frontend

# Security vulnerabilities
npm audit --json 2>/dev/null | jq '{vulnerabilities: .metadata.vulnerabilities, total: .metadata.totalDependencies}'

# Outdated packages
npm outdated --json 2>/dev/null | jq 'to_entries | map({package: .key, current: .value.current, wanted: .value.wanted, latest: .value.latest}) | sort_by(.package)'

# Check Expo SDK compatibility
npx expo-doctor 2>&1 | tail -30
```

### Step 4: Compatibility Check
- Verify Expo SDK 54 compatibility with all RN packages
- Check for known incompatibilities between package versions
- Flag any packages that need platform-specific handling (.web.js/.native.js)

### Step 5: Report
```
## Dependency Audit Report

### Backend (Maven)
| Dependency | Current | Latest | Status |
|------------|---------|--------|--------|
| spring-boot | x.x.x | x.x.x | ✅/⚠️ |

### Frontend (npm)
| Package | Current | Wanted | Latest | Status |
|---------|---------|--------|--------|--------|
| expo | x.x.x | x.x.x | x.x.x | ✅/⚠️ |

### Security
- Critical: [count]
- High: [count]
- Moderate: [count]

### Recommendations
1. [action item]
```

## Rules
- NEVER run `npm update`, `npm install`, or `./mvnw versions:set` — this is READ-ONLY
- Use `jq` for parsing JSON output, `xmlstarlet` for pom.xml
- Report actionable recommendations, not just raw data
- Flag breaking changes separately from minor updates
