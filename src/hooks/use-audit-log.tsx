/**
 * useAuditLog Hook
 * PATCH 123.0 - Audit Trail por Role
 *
 * Hook for automatically logging user actions with role context
 */

import { memo, memo, useCallback, useEffect, useMemo, useRef } from "react";;;
import type { ComponentType } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database, Json } from "@/integrations/supabase/types";

type LogUserActionArgs = Database["public"]["Functions"]["log_user_action"]["Args"];
type LogUserActionReturn = Database["public"]["Functions"]["log_user_action"]["Returns"];
type AuditLogStatus = "success" | "failure" | "error";
type JsonObject = Record<string, Json | undefined>;

interface LogActionParams {
  action: LogUserActionArgs["p_action"];
  resourceType: LogUserActionArgs["p_resource_type"];
  resourceId?: LogUserActionArgs["p_resource_id"] | null;
  status?: AuditLogStatus;
  details?: Json;
}

const isJsonObject = (value: Json | undefined): value is JsonObject => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const normalizeDetails = (details?: Json): JsonObject => {
  if (!details) {
    return {};
  }

  if (isJsonObject(details)) {
    return Object.fromEntries(
      Object.entries(details).filter(([, val]) => val !== undefined)
    ) as JsonObject;
  }

  return { value: details };
};

/**
 * Hook to log user actions with audit trail
 */
export const useAuditLog = memo(() => {
  const { user } = useAuth();

  const userContextDetails = useMemo<JsonObject>(() => {
    if (!user) {
      return {};
    }

    const userMetadata = (user.app_metadata as Record<string, Json | undefined>) || {};
    const preferredRole = userMetadata?.role || user.user_metadata?.role;

    return {
      user_id: user.id,
      user_email: user.email ?? undefined,
      user_role: typeof preferredRole === "string" ? preferredRole : undefined,
    } satisfies JsonObject;
  }, [user]);

  /**
   * Log a user action to the audit trail
   */
  const logAction = useCallback(async ({
    action,
    resourceType,
    resourceId,
    status = "success",
    details,
  }: LogActionParams) => {
    if (!user) {
      return null;
    }

    if (!action || !resourceType) {
      return null;
    }

    const mergedDetails = {
      ...normalizeDetails(details),
      ...userContextDetails,
    } satisfies JsonObject;

    try {
      const { data, error } = await supabase.rpc<LogUserActionReturn>("log_user_action", {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId ?? undefined,
        p_status: status,
        p_details: mergedDetails,
      });

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error logging action:", error);
      console.error("Error logging action:", error);
      return null;
    }
  }, [user, userContextDetails]);

  /**
   * Log a successful action
   */
  const logSuccess = useCallback((
    action: string,
    resourceType: string,
    resourceId?: string | null,
    details?: Record<string, unknown>
  ) => {
    return logAction({ action, resourceType, resourceId, status: "success", details: details as any });
  }, [logAction]);

  /**
   * Log a failed action
   */
  const logFailure = useCallback((
    action: string,
    resourceType: string,
    resourceId?: string | null,
    details?: Record<string, unknown>
  ) => {
    return logAction({ action, resourceType, resourceId, status: "failure", details: details as any });
  }, [logAction]);

  /**
   * Log an error action
   */
  const logError = useCallback((
    action: string,
    resourceType: string,
    error: Error | string,
    resourceId?: string | null,
    details?: Json
  ) => {
    const errorDetails: JsonObject = {
      ...normalizeDetails(details),
      error: typeof error === "string" ? error : error.message,
      stack: typeof error === "string" ? undefined : error.stack,
    };
    return logAction({ action, resourceType, resourceId, status: "error", details: errorDetails });
  }, [logAction]);

  return {
    logAction,
    logSuccess,
    logFailure,
    logError,
  };
};

/**
 * HOC to wrap components with automatic audit logging
 * Note: For TypeScript compatibility, consider using the useAuditLog hook directly
 * instead of this HOC in your components.
 */
export function withAuditLog<Props extends Record<string, unknown>>(
  Component: ComponentType<Props>,
  config: {
    action: string;
    resourceType: string;
    getResourceId?: (props: Props) => string | undefined;
  }
) {
  const { action, resourceType, getResourceId } = config;

  const AuditLogWrapper = (props: Props) => {
    const { logAction } = useAuditLog();
    const lastPayloadRef = useRef<{ action: string; resourceType: string; resourceId?: string }>();
    const resourceId = useMemo(
      () => (getResourceId ? getResourceId(props) : undefined),
      [getResourceId, props]
    );

    useEffect(() => {
      const payload = {
        action,
        resourceType,
        resourceId,
        status: "success" as AuditLogStatus,
      };

      const lastPayload = lastPayloadRef.current;
      if (
        lastPayload &&
        lastPayload.action === payload.action &&
        lastPayload.resourceType === payload.resourceType &&
        lastPayload.resourceId === payload.resourceId
      ) {
        return;
      }

      lastPayloadRef.current = {
        action: payload.action,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
      };

      logAction(payload);
    }, [action, resourceType, logAction, resourceId]);

    return <Component {...props} />;
  };

  return AuditLogWrapper;
};
