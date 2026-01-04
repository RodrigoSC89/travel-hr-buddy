/**
 * Routes Index
 * Centralized route exports
 */

// Route groups
export { aiRoutes } from "./ai.routes";
export { securityRoutes } from "./security.routes";
export { operationsRoutes } from "./operations.routes";
export { complianceRoutes } from "./compliance.routes";
export { v2ModulesRoutes } from "./v2-modules.routes";
export { integrationsRoutes } from "./integrations.routes";
export { executiveRoutes } from "./executive.routes";

// Lazy imports for direct use
export * from "./lazy-imports";

// Types
export type { AppRoute, RouteMetadata, LazyComponent } from "./types";
