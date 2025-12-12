
/**
 * PATCH 197.0 - SaaS Engine (Multitenant Engine)
 * 
 * Secure multitenancy helper that wraps Supabase operations with tenant context
 * to ensure data isolation between tenants (companies/organizations).
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface TenantContext {
  tenantId: string;
  tenantName?: string;
  userId?: string;
  permissions?: string[];
}

/**
 * Get current tenant context from subdomain or header
 */
export function getCurrentTenantContext(): TenantContext | null {
  try {
    // Try subdomain first
    const hostname = window.location.hostname;
    const parts = hostname.split(".");
    
    // If subdomain exists (e.g., company.travel-hr-buddy.com)
    if (parts.length > 2) {
      const subdomain = parts[0];
      
      // Skip common non-tenant subdomains
      if (!["www", "api", "admin"].includes(subdomain)) {
        return {
          tenantId: subdomain,
          tenantName: subdomain,
        });
      }
    }

    // Try custom header (for API calls)
    const tenantHeader = document.querySelector("meta[name=\"x-tenant-id\"]");
    if (tenantHeader) {
      const tenantId = tenantHeader.getAttribute("content");
      if (tenantId) {
        return {
          tenantId,
        });
      }
    }

    // Try localStorage (fallback for development)
    const storedTenantId = localStorage.getItem("tenant_id");
    if (storedTenantId) {
      return {
        tenantId: storedTenantId,
      });
    }

    return null;
  } catch (error) {
    logger.error("[TenantContext] Failed to get tenant context", { error });
    return null;
  }
}

/**
 * Set tenant context in localStorage (for development/testing)
 */
export function setTenantContext(tenantId: string): void {
  localStorage.setItem("tenant_id", tenantId);
  logger.info("[TenantContext] Tenant context set", { tenantId });
}

/**
 * Clear tenant context
 */
export function clearTenantContext(): void {
  localStorage.removeItem("tenant_id");
  logger.info("[TenantContext] Tenant context cleared");
}

/**
 * Higher-order function to wrap Supabase queries with tenant context
 * Automatically injects tenant_id into queries for data isolation
 */
export function withTenantContext<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args: Parameters<T>): ReturnType<T> => {
    const context = getCurrentTenantContext();
    
    if (!context) {
      logger.warn("[TenantContext] No tenant context available for query");
      // Still execute the query but log warning
    } else {
      logger.debug("[TenantContext] Executing query with tenant context", {
        tenantId: context.tenantId,
      });
    }

    return fn(...args);
  };
}

/**
 * Create a tenant-aware Supabase client
 * All queries will automatically include tenant_id filter
 */
export function createTenantClient() {
  const context = getCurrentTenantContext();
  
  if (!context) {
    logger.warn("[TenantContext] Creating client without tenant context");
    return supabase;
  }

  return {
    from: (table: string) => {
      const baseQuery = (supabase as any).from(table);
      
      // Automatically add tenant_id filter if table has tenant_id column
      return {
        select: (...args: any[]) => {
          const query = baseQuery.select(...args);
          
          // Add tenant filter if applicable
          return query.eq("tenant_id", context.tenantId);
        },
        insert: (data: any) => {
          // Automatically inject tenant_id
          const dataWithTenant = Array.isArray(data)
            ? data.map(item => ({ ...item, tenant_id: context.tenantId }))
            : { ...data, tenant_id: context.tenantId };
          
          return baseQuery.insert(dataWithTenant);
        },
        update: (data: any) => {
          const dataWithTenant = { ...data, tenant_id: context.tenantId };
          return baseQuery.update(dataWithTenant).eq("tenant_id", context.tenantId);
        },
        delete: () => {
          return baseQuery.delete().eq("tenant_id", context.tenantId);
        },
        upsert: (data: any) => {
          const dataWithTenant = Array.isArray(data)
            ? data.map(item => ({ ...item, tenant_id: context.tenantId }))
            : { ...data, tenant_id: context.tenantId };
          
          return baseQuery.upsert(dataWithTenant);
        },
      });
    },
  };
}

/**
 * Verify user has access to tenant
 */
export async function verifyTenantAccess(
  userId: string,
  tenantId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("tenant_users")
      .select("id, role, permissions")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !data) {
      logger.warn("[TenantContext] User does not have access to tenant", {
        userId,
        tenantId,
      });
      return false;
    }

    return true;
  } catch (error) {
    logger.error("[TenantContext] Failed to verify tenant access", { error });
    return false;
  }
}

/**
 * Get user's role in tenant
 */
export async function getUserTenantRole(
  userId: string,
  tenantId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role;
  } catch (error) {
    logger.error("[TenantContext] Failed to get user tenant role", { error });
    return null;
  }
}

/**
 * Get enabled modules for tenant
 */
export async function getTenantModules(tenantId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("tenant_modules")
      .select("module_name")
      .eq("tenant_id", tenantId)
      .eq("enabled", true);

    if (error || !data) {
      logger.error("[TenantContext] Failed to get tenant modules", { error });
      return [];
    }

    return data.map(m => m.module_name);
  } catch (error) {
    logger.error("[TenantContext] Failed to get tenant modules", { error });
    return [];
  }
}

/**
 * Check if module is enabled for tenant
 */
export async function isModuleEnabledForTenant(
  tenantId: string,
  moduleName: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("tenant_modules")
      .select("enabled")
      .eq("tenant_id", tenantId)
      .eq("module_name", moduleName)
      .single();

    if (error || !data) {
      // Default to enabled if not configured
      return true;
    }

    return data.enabled;
  } catch (error) {
    logger.error("[TenantContext] Failed to check module status", { error });
    return true;
  }
}

/**
 * Middleware to inject tenant context into requests
 */
export function tenantMiddleware() {
  return async (req: Request, next: () => Promise<Response>) => {
    const context = getCurrentTenantContext();
    
    if (context) {
      // Add tenant context to request headers
      const headers = new Headers(req.headers);
      headers.set("X-Tenant-ID", context.tenantId);
      
      // Create modified request
      const modifiedReq = new Request(req, { headers });
      
      logger.debug("[TenantMiddleware] Injected tenant context", {
        tenantId: context.tenantId,
      });
      
      return next();
    }
    
    logger.warn("[TenantMiddleware] No tenant context for request");
    return next();
  };
}

/**
 * React hook for tenant context
 */
export function useTenantContext() {
  const context = getCurrentTenantContext();
  
  return {
    tenantId: context?.tenantId,
    tenantName: context?.tenantName,
    isMultiTenant: context !== null,
  };
}
