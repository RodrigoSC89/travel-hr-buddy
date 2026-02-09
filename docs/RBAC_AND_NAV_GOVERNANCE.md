# NAUTI ONE — RBAC & Navigation Governance

## Navigation Source of Truth
- **File**: `src/config/sidebar-routes.ts`
- **Structure**: 8 groups (7 mega-hubs + World-Class)
- **Total routes**: 70+ sidebar items

## Role Hierarchy

| Role | Level | Description |
|------|-------|-------------|
| admin | 100 | Full system access |
| hr_manager | 80 | HR + People modules |
| department_manager | 70 | Department-level ops |
| manager | 60 | Operational management |
| supervisor | 50 | Team supervision |
| coordinator | 40 | Process coordination |
| hr_analyst | 30 | HR read + analytics |
| auditor | 20 | Audit + compliance read |
| employee | 10 | Self-service only |

## RBAC Matrix (Role → Hub Access)

| Hub | admin | hr_manager | manager | supervisor | auditor | employee |
|-----|-------|------------|---------|------------|---------|----------|
| Command | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ops | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Maintenance | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| AI | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Tracking | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| Compliance | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Workbench | ✅ | ✅ | ✅ | ✅ | ✅ | ✅* |
| World-Class | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |

*Employee access limited to People/Portal sections

## Feature Flags
- **File**: `src/lib/feature-flags.ts`
- **Production safety**: `STRICT_PROD` blocks mocks
- **Module flags**: UNDERWATER, VRAR, AI_AUTONOMY, BLOCKCHAIN, etc.
- **Integration flags**: FF_BRIDGELINK_LIVE_WS, FF_STARFIX_REAL_API, etc.

## Route Protection
- **ProtectedRoute**: Requires auth session (`src/App.tsx`)
- **Sidebar filtering**: `requiredRoles` on SidebarRoute items
- **RBAC hook**: `usePermissions()` + `useModuleAccess()`

## How to Test
1. Login with different roles
2. Verify sidebar shows only permitted items
3. Direct URL access to restricted route → "Access denied"
4. Feature flags toggled via localStorage or env vars
