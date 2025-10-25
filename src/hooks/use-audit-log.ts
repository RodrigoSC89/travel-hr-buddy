/**
 * useAuditLog Hook
 * PATCH 123.0 - Audit Trail por Role
 * 
 * Hook for automatically logging user actions with role context
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LogActionParams {
  action: string;
  resourceType: string;
  resourceId?: string;
  status?: 'success' | 'failure' | 'error';
  details?: Record<string, any>;
}

/**
 * Hook to log user actions with audit trail
 */
export const useAuditLog = () => {
  const { user } = useAuth();

  /**
   * Log a user action to the audit trail
   */
  const logAction = useCallback(async ({
    action,
    resourceType,
    resourceId,
    status = 'success',
    details = {},
  }: LogActionParams) => {
    if (!user) {
      console.warn("Cannot log action: User not authenticated");
      return null;
    }

    try {
      const { data, error } = await supabase.rpc('log_user_action', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_status: status,
        p_details: details,
      });

      if (error) {
        console.error("Error logging action:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error logging action:", error);
      return null;
    }
  }, [user]);

  /**
   * Log a successful action
   */
  const logSuccess = useCallback((
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    return logAction({ action, resourceType, resourceId, status: 'success', details });
  }, [logAction]);

  /**
   * Log a failed action
   */
  const logFailure = useCallback((
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    return logAction({ action, resourceType, resourceId, status: 'failure', details });
  }, [logAction]);

  /**
   * Log an error action
   */
  const logError = useCallback((
    action: string,
    resourceType: string,
    error: Error | string,
    resourceId?: string,
    details?: Record<string, any>
  ) => {
    const errorDetails = {
      ...details,
      error: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
    };
    return logAction({ action, resourceType, resourceId, status: 'error', details: errorDetails });
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
 */
export const withAuditLog = <P extends object>(
  Component: React.ComponentType<P>,
  config: {
    action: string;
    resourceType: string;
    getResourceId?: (props: P) => string | undefined;
  }
) => {
  return (props: P) => {
    const { logAction } = useAuditLog();

    React.useEffect(() => {
      const resourceId = config.getResourceId ? config.getResourceId(props) : undefined;
      logAction({
        action: config.action,
        resourceType: config.resourceType,
        resourceId,
        status: 'success',
      });
    }, []);

    return <Component {...props} />;
  };
};
