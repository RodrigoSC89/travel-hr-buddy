/**
 * useAuditTrail - Hook for logging actions to system_audit_trail
 * Provides automatic audit logging for all critical operations
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fromUntyped } from "@/integrations/supabase/untyped-client";
import { logger } from "@/lib/logger";

interface AuditEntry {
  action_type: "create" | "update" | "delete" | "login" | "export" | "approve" | "reject" | "view";
  module: string;
  resource_type?: string;
  resource_id?: string;
  description?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  severity?: "info" | "warning" | "critical";
}

export function useAuditTrail() {
  const log = useCallback(async (entry: AuditEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await fromUntyped("system_audit_trail").insert({
        user_id: user?.id,
        action_type: entry.action_type,
        module: entry.module,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        description: entry.description,
        changes: entry.changes,
        metadata: {
          ...entry.metadata,
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
        severity: entry.severity || "info",
      });
    } catch (err) {
      // Never fail the main operation because of audit logging
      logger.warn("[AuditTrail] Failed to log entry", { error: String(err), entry });
    }
  }, []);

  const logCreate = useCallback((module: string, resourceType: string, resourceId: string, description?: string) => {
    return log({ action_type: "create", module, resource_type: resourceType, resource_id: resourceId, description });
  }, [log]);

  const logUpdate = useCallback((module: string, resourceType: string, resourceId: string, changes?: Record<string, { old: unknown; new: unknown }>) => {
    return log({ action_type: "update", module, resource_type: resourceType, resource_id: resourceId, changes });
  }, [log]);

  const logDelete = useCallback((module: string, resourceType: string, resourceId: string, description?: string) => {
    return log({ action_type: "delete", module, resource_type: resourceType, resource_id: resourceId, description, severity: "warning" });
  }, [log]);

  const logExport = useCallback((module: string, description?: string) => {
    return log({ action_type: "export", module, description });
  }, [log]);

  const logApproval = useCallback((module: string, resourceType: string, resourceId: string, approved: boolean, description?: string) => {
    return log({ 
      action_type: approved ? "approve" : "reject", 
      module, 
      resource_type: resourceType, 
      resource_id: resourceId, 
      description,
      severity: approved ? "info" : "warning",
    });
  }, [log]);

  return { log, logCreate, logUpdate, logDelete, logExport, logApproval };
}
