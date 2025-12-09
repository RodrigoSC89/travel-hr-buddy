/**
 * Multi-Tenant Validation Utilities
 * PATCH: Security hardening for cross-tenant isolation
 */

// @ts-ignore - Deno imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export interface TenantContext {
  userId: string;
  organizationId: string;
  roles: string[];
  isAdmin: boolean;
  isHR: boolean;
}

/**
 * Validates tenant access and returns context
 */
export async function validateTenantAccess(
  req: Request,
  supabaseUrl: string,
  supabaseKey: string
): Promise<TenantContext | null> {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header");
      return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return null;
    }

    // Get user's organization and roles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile error:", profileError?.message);
      return null;
    }

    // Get detailed roles if available
    const { data: userRoles } = await supabase
      .from("user_roles")
      .select("role, is_active")
      .eq("user_id", user.id)
      .eq("organization_id", profile.organization_id)
      .eq("is_active", true);

    const roles = userRoles?.map((r: { role: string }) => r.role) || [profile.role];

    return {
      userId: user.id,
      organizationId: profile.organization_id,
      roles,
      isAdmin: roles.includes("admin") || roles.includes("super_admin"),
      isHR: roles.includes("hr_manager") || roles.includes("hr"),
    };
  } catch (error) {
    console.error("Tenant validation error:", error);
    return null;
  }
}

/**
 * Validates that a resource belongs to the user's organization
 */
export async function validateResourceAccess(
  supabaseUrl: string,
  supabaseKey: string,
  authHeader: string,
  tableName: string,
  resourceId: string,
  organizationField = "organization_id"
): Promise<boolean> {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile) return false;

    const { data: resource } = await supabase
      .from(tableName)
      .select(organizationField)
      .eq("id", resourceId)
      .single();

    return resource?.[organizationField] === profile.organization_id;
  } catch (error) {
    console.error("Resource validation error:", error);
    return false;
  }
}

/**
 * Sanitizes input to prevent injection attacks
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === "string") {
    // Remove potential SQL injection patterns
    return input
      .replace(/['"`;\\]/g, "")
      .replace(/--/g, "")
      .replace(/\/\*/g, "")
      .replace(/\*\//g, "")
      .trim()
      .slice(0, 10000); // Limit length
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      // Sanitize key names too
      const safeKey = key.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 100);
      sanitized[safeKey] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Creates an audit log entry for security-sensitive operations
 */
export async function createSecurityAuditLog(
  supabaseUrl: string,
  serviceRoleKey: string,
  entry: {
    userId: string;
    organizationId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    await supabase.from("audit_logs").insert({
      user_id: entry.userId,
      organization_id: entry.organizationId,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId,
      metadata: {
        ...entry.details,
        security_audit: true,
        timestamp: new Date().toISOString(),
      },
      ip_address: entry.ipAddress || "unknown",
      user_agent: entry.userAgent || "unknown",
    });
  } catch (error) {
    console.error("Failed to create security audit log:", error);
    // Don't throw - audit log failure shouldn't break the operation
  }
}
