# NAUTI ONE — E2E Coverage Matrix

## Test Coverage by Module

| Module | Navigate | List | Create | Edit | Delete | Export | Upload | Filters | Errors |
|--------|----------|------|--------|------|--------|--------|--------|---------|--------|
| **Command Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Ops Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Maintenance Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **AI Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Tracking Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Compliance Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Workbench Hub** | ✅ | - | - | - | - | - | - | - | ✅ |
| **PEO-DP** | ✅ | - | - | - | - | - | - | - | - |
| **PEOTRAM** | ✅ | - | - | - | - | - | - | - | - |
| **SGSO ANP** | ✅ | - | - | - | - | - | - | - | - |
| **Risk Matrix** | ✅ | - | - | - | - | - | - | - | - |
| **PSC Package** | ✅ | - | - | - | - | - | - | - | - |
| **MLC Inspection** | ✅ | - | - | - | - | - | - | - | - |
| **Documents** | ✅ | - | - | - | - | - | - | - | - |
| **Finance** | ✅ | - | - | - | - | - | - | - | - |
| **HR Dashboard** | ✅ | - | - | - | - | - | - | - | - |
| **Medical** | ✅ | - | - | - | - | - | - | - | - |
| **Settings** | ✅ | - | - | - | - | - | - | - | - |
| **Fleet Pulse** | ✅ | - | - | - | - | - | - | - | - |
| **Pred. Maint.** | ✅ | - | - | - | - | - | - | - | - |
| **DP Intelligence** | ✅ | - | - | - | - | - | - | - | - |
| **Auth** | ✅ | - | - | - | - | - | - | - | ✅ |
| **Landing** | ✅ | - | - | - | - | - | - | - | - |

### Legend
- ✅ = Test implemented
- `-` = Not yet implemented (planned for next iteration)

### Coverage Summary
- **Navigation coverage**: 100% of mega-hubs + 14 critical routes
- **CRUD coverage**: 0% (Phase 2 next iteration)
- **Error handling coverage**: 8 smoke tests

### Test Files
- `tests/e2e/smoke.spec.ts` — Core navigation smoke tests
- `tests/e2e/common/helpers.ts` — Shared test utilities
- `e2e/sidebar-structure.spec.ts` — Sidebar validation (existing)
