# NAUTI ONE — Phase 2 Hardening Plan

## Objective
Transform NAUTI ONE from "it works" to "unbreakable" enterprise software.

## Phases

### 2.1 — E2E Tests (Playwright)
- [x] Smoke test: auth, mega-hubs, critical routes
- [x] Test helpers: login, navigation, error collection
- [ ] Hub-specific CRUD tests (Operations, Maintenance, Compliance, etc.)
- [x] E2E coverage matrix document

### 2.2 — Data Contracts (Zod)
- [x] Core entity schemas: Vessel, CrewMember, Document, Incident, Audit, ActionItem
- [x] Error normalization: Supabase errors → UX-friendly PT-BR messages
- [x] useSupabaseMutation: standardized mutation hook with auto-invalidation
- [ ] Apply Zod validation to all CRUD hooks

### 2.3 — Observability (Sentry + Logs)
- [x] Sentry already configured (sentry.client.config.ts)
- [x] Query instrumentation (src/lib/observability.ts)
- [x] User action tracking
- [ ] Health panel in System Hub (existing: HealthMonitor page)

### 2.4 — Performance
- [x] Code splitting by hub (lazy imports in App.tsx)
- [x] react-virtual available (installed)
- [ ] Lighthouse baseline measurements
- [x] Skeletons/LoadingState component created

### 2.5 — A11Y + UX Consistency
- [x] Shared components: EmptyState, ErrorState, LoadingState, PageHeader
- [ ] axe-core audit on main routes
- [ ] Focus trap, keyboard nav, contrast checks

### 2.6 — RBAC + Nav Governance
- [x] Sidebar routes as source of truth (sidebar-routes.ts)
- [x] Role hierarchy defined (ROLE_HIERARCHY)
- [x] Feature flags system (src/lib/feature-flags.ts)
- [ ] RBAC enforcement on protected routes

## Status: IN PROGRESS
