/**
 * Auth Components Index
 * Exports for PATCHES 120-124: Security, RBAC, and Session Management
 */

export { RoleGuard, useHasRole, useHasMinRole } from "./RoleGuard";
export { SessionManagement, SessionManagementCompact } from "./SessionManagement";
export { RoleConfigurator } from "./RoleConfigurator";
export { AuditTrailViewer } from "./AuditTrailViewer";

// Re-export existing components for convenience
export { RoleBasedAccess } from "./role-based-access";
export { PermissionGuard } from "./permission-guard";
