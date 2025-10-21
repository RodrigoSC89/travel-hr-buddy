/**
 * Centralized exports for all application contexts
 * 
 * This file provides a single import point for all contexts and their hooks,
 * making it easier to import and use them throughout the application.
 * 
 * @example
 * import { AuthProvider, useAuth, TenantProvider, useTenant } from '@/contexts';
 */

export { AuthProvider, useAuth } from "./AuthContext";
export { TenantProvider, useTenant } from "./TenantContext";
export { OrganizationProvider, useOrganization } from "./OrganizationContext";

// Re-export types for convenience
export type { User, Session } from "@supabase/supabase-js";
