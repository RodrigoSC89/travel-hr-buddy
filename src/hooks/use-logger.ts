/**
 * PATCH 89.4 - useLogger Hook
 * React hook for dashboard logging with automatic context tracking
 */

import { useEffect, useRef, useCallback } from 'react';
import { logger } from '@/lib/logger';
import { supabase } from '@/integrations/supabase/client';

export interface UseLoggerOptions {
  module: string;
  componentName?: string;
  enableSupabaseLogging?: boolean;
}

export interface DashboardLogger {
  logMount: () => void;
  logDataLoad: (dataType: string, success: boolean, metadata?: any) => void;
  logAIActivation: (action: string, success: boolean, metadata?: any) => void;
  logUserAction: (action: string, metadata?: any) => void;
  logError: (error: any, context?: any) => void;
}

/**
 * Hook for dashboard logging
 * Automatically logs component lifecycle and provides logging utilities
 */
export function useLogger(options: UseLoggerOptions): DashboardLogger {
  const { module, componentName, enableSupabaseLogging = false } = options;
  const mountedRef = useRef(false);
  const componentId = componentName || module;

  // Log component mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      logger.info(`${componentId} mounted`, { module });
      
      if (enableSupabaseLogging) {
        logToSupabase('mount', 'info', `${componentId} mounted`, { module });
      }
    }

    // Log component unmount
    return () => {
      logger.info(`${componentId} unmounted`, { module });
      
      if (enableSupabaseLogging) {
        logToSupabase('unmount', 'info', `${componentId} unmounted`, { module });
      }
    };
  }, [componentId, module, enableSupabaseLogging]);

  // Log component mount explicitly (for manual calls)
  const logMount = useCallback(() => {
    logger.info(`${componentId} initialized`, { module });
    
    if (enableSupabaseLogging) {
      logToSupabase('init', 'info', `${componentId} initialized`, { module });
    }
  }, [componentId, module, enableSupabaseLogging]);

  // Log data loading operations
  const logDataLoad = useCallback((dataType: string, success: boolean, metadata?: any) => {
    const message = `${componentId}: ${dataType} load ${success ? 'successful' : 'failed'}`;
    
    if (success) {
      logger.info(message, { module, dataType, ...metadata });
    } else {
      logger.error(message, null, { module, dataType, ...metadata });
    }

    if (enableSupabaseLogging) {
      logToSupabase(
        'data_load',
        success ? 'info' : 'error',
        message,
        { module, dataType, success, ...metadata }
      );
    }
  }, [componentId, module, enableSupabaseLogging]);

  // Log AI activation
  const logAIActivation = useCallback((action: string, success: boolean, metadata?: any) => {
    const message = `${componentId}: AI ${action} ${success ? 'completed' : 'failed'}`;
    
    if (success) {
      logger.info(message, { module, action, ai: true, ...metadata });
    } else {
      logger.error(message, null, { module, action, ai: true, ...metadata });
    }

    if (enableSupabaseLogging) {
      logToSupabase(
        'ai_activation',
        success ? 'info' : 'error',
        message,
        { module, action, success, ai: true, ...metadata }
      );
    }
  }, [componentId, module, enableSupabaseLogging]);

  // Log user actions
  const logUserAction = useCallback((action: string, metadata?: any) => {
    const message = `${componentId}: User action - ${action}`;
    
    logger.info(message, { module, action, ...metadata });

    if (enableSupabaseLogging) {
      logToSupabase('user_action', 'info', message, { module, action, ...metadata });
    }
  }, [componentId, module, enableSupabaseLogging]);

  // Log errors
  const logError = useCallback((error: any, context?: any) => {
    const message = `${componentId}: Error occurred`;
    
    logger.error(message, error, { module, ...context });

    if (enableSupabaseLogging) {
      logToSupabase(
        'error',
        'error',
        message,
        {
          module,
          error: error?.message || String(error),
          ...context,
        }
      );
    }
  }, [componentId, module, enableSupabaseLogging]);

  return {
    logMount,
    logDataLoad,
    logAIActivation,
    logUserAction,
    logError,
  };
}

/**
 * Store log entry in Supabase
 * Note: Requires 'logs' table in Supabase
 */
async function logToSupabase(
  event: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: any
) {
  try {
    // Check if logs table exists by attempting to insert
    const { error } = await supabase.from('logs').insert({
      event,
      level,
      message,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Only log in development if table doesn't exist
      if (import.meta.env.DEV && error.message.includes('relation "public.logs" does not exist')) {
        console.debug('Supabase logs table not configured, skipping database logging');
      }
    }
  } catch (error) {
    // Silently fail - logging should never break the app
    if (import.meta.env.DEV) {
      console.debug('Failed to log to Supabase:', error);
    }
  }
}
