# 🔐 RBAC Implementation Report

## Route Guards

| Guard | Roles | Location |
|-------|-------|----------|
| `AdminRoute` | `admin` | App.tsx — wraps `/admin/*` routes |
| `ManagerRoute` | `admin`, `hr_manager`, `manager`, `supervisor`, `department_manager` | App.tsx |
| `ProtectedRoute` | Any authenticated user | App.tsx — wraps all `/` routes |
| `RoleGuard` | Configurable via `requiredRoles` prop | `src/components/auth/RoleGuard.tsx` |
| `PermissionGuard` | Permission-based (users, certificates, reports, etc.) | `src/components/auth/permission-guard.tsx` |

## Database Functions
- `is_admin()` — checks if current user has admin role
- `is_manager_or_above()` — checks manager+ roles
- `is_admin_or_hr()` — checks admin or hr_manager
- `has_global_access()` — checks broad access roles
- `has_vessel_access()` — vessel-level access control
- `has_finance_access()` — finance module access

## RLS Policies
- 2,260+ RLS policies across 711+ tables
- All user-specific tables use `auth.uid()` checks
- Multi-tenant isolation via `organization_id` filters

## Auth Protection
- Controlled by `VITE_ENABLE_AUTH_PROTECTION` env var
- When enabled: unauthenticated → `/auth`, unauthorized → `/unauthorized`
