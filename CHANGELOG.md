# Changelog

Releases published by the AI Conveyor on the integration branch.

## demo-v0.2.0 — 2026-09-16

### Refactoring
- **backend:** migrate remaining Jackson 2 usages to Jackson 3 API (#70)

### Tests
- **notification:** verify test-notification endpoint is admin-only and dev-only at runtime (#61)

### Build and CI
- **backend:** upgrade Spring Boot parent from 3.4.1 to 4.1.1 (#67)
- **backend:** bump Lombok to 1.18.48 for JDK 25 support (#68)
- build the backend on JDK 25 (#69)
- **dev:** upgrade docker-compose Postgres to the latest major version (#71)
- **backend:** move backend to Java 25 and bump dependencies to latest (#72)

## demo-v0.1.0 — 2026-09-14

### Features
- **frontend:** add formatDoseLabel helper (#38)

### Fixes
- **user:** restrict user admin endpoints to ROLE_ADMIN (#50)
- **statistic:** enforce owner or admin access on statistic endpoints (#51)
- **frontend:** unify API base URL resolver and bump Docker image to Node 22 (#52)

### Performance
- **notification:** query only reminder candidates for the current minute (#57)

### Refactoring
- **notification:** use Europe/Budapest clock and pure reminder matcher in schedulers (#56)

### Tests
- **backend:** add test profile and JWT auth test helpers (#48)
- **frontend:** set up React Native Testing Library with smoke tests (#49)

### Build and CI
- run CI for ai/demo, add frontend test job, lowercase GHCR image
