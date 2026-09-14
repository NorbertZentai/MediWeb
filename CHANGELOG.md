# Changelog

Releases published by the AI Conveyor on the integration branch.

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
