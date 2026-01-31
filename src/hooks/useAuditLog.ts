/**
 * useAuditLog - Hook para auditoria de mutações CRUD
 * Registra todas as operações críticas para compliance e auditoria
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete' 
  | 'archive' 
  | 'restore'
  | 'export'
  | 'import'
  | 'approve'
  | 'reject'
  | 'login'
  | 'logout';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  user_email?: string;
  action: AuditAction;
  entity_type: string; // e.g., 'vessel', 'crew_member', 'contract'
  entity_id?: string;
  entity_name?: string;
  changes?: Record<string, { old: unknown; new: unknown }>;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  success: boolean;
  error_message?: string;
}

/**
 * Hook para criar entradas de audit log
 */
export function useAuditLog() {
  const { user } = useAuth();

  const log = useCallback(async (
    action: AuditAction,
    entityType: string,
    options: {
      entityId?: string;
      entityName?: string;
      changes?: Record<string, { old: unknown; new: unknown }>;
      metadata?: Record<string, unknown>;
      success?: boolean;
      errorMessage?: string;
    } = {}
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const entry: AuditLogEntry = {
        user_id: user.id,
        user_email: user.email,
        action,
        entity_type: entityType,
        entity_id: options.entityId,
        entity_name: options.entityName,
        changes: options.changes,
        metadata: options.metadata,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        timestamp: new Date().toISOString(),
        success: options.success ?? true,
        error_message: options.errorMessage,
      };

      const { data, error } = await supabase
        .from('system_audit_logs')
        .insert(entry as any)
        .select('id')
        .single();

      if (error) {
        // Fallback: try simpler insert if table doesn't have all columns
        const { data: fallbackData } = await supabase
          .from('audit_logs')
          .insert({
            user_id: entry.user_id,
            action: entry.action,
            entity_type: entry.entity_type,
            entity_id: entry.entity_id,
            metadata: JSON.stringify({ ...entry.metadata, changes: entry.changes }),
            created_at: entry.timestamp,
          } as any)
          .select('id')
          .single();

        return fallbackData?.id || null;
      }

      return data?.id || null;
    } catch {
      // Silent fail - audit logs should not break the main flow
      return null;
    }
  }, [user]);

  const logCreate = useCallback((
    entityType: string,
    entityId: string,
    entityName?: string,
    metadata?: Record<string, unknown>
  ) => {
    return log('create', entityType, { entityId, entityName, metadata });
  }, [log]);

  const logUpdate = useCallback((
    entityType: string,
    entityId: string,
    changes: Record<string, { old: unknown; new: unknown }>,
    entityName?: string
  ) => {
    return log('update', entityType, { entityId, entityName, changes });
  }, [log]);

  const logDelete = useCallback((
    entityType: string,
    entityId: string,
    entityName?: string
  ) => {
    return log('delete', entityType, { entityId, entityName });
  }, [log]);

  const logExport = useCallback((
    entityType: string,
    count: number,
    format: string
  ) => {
    return log('export', entityType, { 
      metadata: { count, format, exportedAt: new Date().toISOString() } 
    });
  }, [log]);

  const logApproval = useCallback((
    entityType: string,
    entityId: string,
    approved: boolean,
    comments?: string
  ) => {
    return log(approved ? 'approve' : 'reject', entityType, { 
      entityId, 
      metadata: { comments, decision: approved ? 'approved' : 'rejected' } 
    });
  }, [log]);

  const logError = useCallback((
    action: AuditAction,
    entityType: string,
    errorMessage: string,
    entityId?: string
  ) => {
    return log(action, entityType, { 
      entityId, 
      success: false, 
      errorMessage 
    });
  }, [log]);

  return {
    log,
    logCreate,
    logUpdate,
    logDelete,
    logExport,
    logApproval,
    logError,
  };
}

/**
 * Higher-order function to wrap mutations with audit logging
 */
export function withAuditLog<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    action: AuditAction;
    entityType: string;
    getEntityId?: (...args: Parameters<T>) => string | undefined;
    getEntityName?: (...args: Parameters<T>) => string | undefined;
    getChanges?: (...args: Parameters<T>) => Record<string, { old: unknown; new: unknown }> | undefined;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = Date.now();
    
    try {
      const result = await fn(...args);
      
      // Log success
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase.from('system_audit_logs').insert({
          user_id: user.user.id,
          action: options.action,
          entity_type: options.entityType,
          entity_id: options.getEntityId?.(...args),
          entity_name: options.getEntityName?.(...args),
          changes: options.getChanges?.(...args),
          success: true,
          duration_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        } as any);
      }
      
      return result;
    } catch (error) {
      // Log failure
      const { data: user } = await supabase.auth.getUser();
      if (user?.user) {
        await supabase.from('system_audit_logs').insert({
          user_id: user.user.id,
          action: options.action,
          entity_type: options.entityType,
          entity_id: options.getEntityId?.(...args),
          success: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          duration_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        } as any);
      }
      
      throw error;
    }
  }) as T;
}

/**
 * Create a migration to add system_audit_logs table
 * Run this SQL in Supabase:
 * 
 * CREATE TABLE IF NOT EXISTS system_audit_logs (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID REFERENCES auth.users(id),
 *   user_email TEXT,
 *   action TEXT NOT NULL,
 *   entity_type TEXT NOT NULL,
 *   entity_id TEXT,
 *   entity_name TEXT,
 *   changes JSONB,
 *   metadata JSONB,
 *   ip_address TEXT,
 *   user_agent TEXT,
 *   success BOOLEAN DEFAULT true,
 *   error_message TEXT,
 *   duration_ms INTEGER,
 *   timestamp TIMESTAMPTZ DEFAULT NOW(),
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX idx_audit_user ON system_audit_logs(user_id);
 * CREATE INDEX idx_audit_action ON system_audit_logs(action);
 * CREATE INDEX idx_audit_entity ON system_audit_logs(entity_type, entity_id);
 * CREATE INDEX idx_audit_timestamp ON system_audit_logs(timestamp DESC);
 * 
 * ALTER TABLE system_audit_logs ENABLE ROW LEVEL SECURITY;
 * 
 * CREATE POLICY "Users can insert own audit logs"
 *   ON system_audit_logs FOR INSERT
 *   WITH CHECK (auth.uid() = user_id);
 * 
 * CREATE POLICY "Admins can read all audit logs"
 *   ON system_audit_logs FOR SELECT
 *   USING (
 *     EXISTS (
 *       SELECT 1 FROM profiles
 *       WHERE profiles.id = auth.uid()
 *       AND profiles.role IN ('admin', 'super_admin', 'auditor')
 *     )
 *   );
 */
