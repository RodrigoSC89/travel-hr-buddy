/**
 * PATCH OPS-V7: Hook para Audit Log
 * Integra com tabela access_logs (disponível no schema)
 * ISM/ISPS Ready - logs de acesso
 * PATCH v28: Fixed types - using access_logs from schema
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { logger } from "@/lib/logger";
import type { Database, Json } from '@/integrations/supabase/types';

type AccessLogRow = Database['public']['Tables']['access_logs']['Row'];

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  result: string;
  severity: string;
  details?: Record<string, unknown>;
}

export interface CreateAuditLogParams {
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT" | "VIEW" | "APPROVE" | "REJECT";
  entityType: string;
  entityId?: string;
  entityName?: string;
  dataBefore?: Record<string, unknown>;
  dataAfter?: Record<string, unknown>;
  sourceModule?: string;
  complianceCategory?: "ISM" | "ISPS" | "MLC" | "SGSO" | "GENERAL";
}

/**
 * Hook para criar audit logs
 */
export function useCreateAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreateAuditLogParams) => {
      const details: Record<string, unknown> = {
        entity_id: params.entityId,
        entity_name: params.entityName,
        data_before: params.dataBefore,
        data_after: params.dataAfter,
        source_module: params.sourceModule,
        compliance_category: params.complianceCategory || "GENERAL",
      };

      const { data, error } = await supabase
        .from("access_logs")
        .insert({
          user_id: user?.id,
          action: params.action,
          module_accessed: params.entityType,
          result: "success",
          severity: "info",
          details: details as Json,
        })
        .select("id")
        .single();

      if (error) {
        logger.error("Failed to create audit log:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
    },
  });
}

/**
 * Hook para buscar audit logs
 */
export function useAuditLogs(filters?: {
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async (): Promise<AuditLogEntry[]> => {
      let query = supabase
        .from("access_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.entityType) {
        query = query.eq("module_accessed", filters.entityType);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      query = query.limit(filters?.limit || 100);

      const { data, error } = await query;

      if (error) {
        logger.error("Failed to fetch audit logs:", error);
        return [];
      }

      return (data || []).map((log: AccessLogRow) => {
        const details = log.details as Record<string, unknown> | null;
        return {
          id: log.id,
          createdAt: log.created_at,
          actorId: log.user_id ?? undefined,
          action: log.action,
          entityType: log.module_accessed,
          entityId: (details?.entity_id as string) ?? undefined,
          result: log.result,
          severity: log.severity,
          details: details ?? undefined,
        };
      });
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook para buscar audit log de uma entidade específica
 */
export function useEntityAuditTrail(entityType: string, entityId: string) {
  return useAuditLogs({
    entityType,
    entityId,
    limit: 50,
  });
}

/**
 * Wrapper para mutations com audit log automático
 */
export function useAuditedMutation<TData, TVariables extends { id?: string }>(
  entityType: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    action: CreateAuditLogParams["action"];
    sourceModule: string;
    complianceCategory?: CreateAuditLogParams["complianceCategory"];
    getEntityName?: (variables: TVariables) => string;
    getDataBefore?: (variables: TVariables) => Promise<Record<string, unknown> | undefined>;
  }
) {
  const createAuditLog = useCreateAuditLog();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      let dataBefore: Record<string, unknown> | undefined;
      if (options.getDataBefore && (options.action === "UPDATE" || options.action === "DELETE")) {
        dataBefore = await options.getDataBefore(variables);
      }

      const result = await mutationFn(variables);

      await createAuditLog.mutateAsync({
        action: options.action,
        entityType,
        entityId: variables.id,
        entityName: options.getEntityName?.(variables),
        dataBefore,
        dataAfter: options.action !== "DELETE" ? (result as Record<string, unknown>) : undefined,
        sourceModule: options.sourceModule,
        complianceCategory: options.complianceCategory,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType] });
    },
  });
}

/**
 * Export audit logs para CSV
 */
export async function exportAuditLogsToCSV(logs: AuditLogEntry[]): Promise<string> {
  const headers = [
    "ID",
    "Data/Hora",
    "Ação",
    "Tipo Entidade",
    "ID Entidade",
    "Resultado",
    "Severidade",
  ];

  const rows = logs.map((log) => [
    log.id,
    new Date(log.createdAt).toLocaleString("pt-BR"),
    log.action,
    log.entityType,
    log.entityId || "",
    log.result,
    log.severity,
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csvContent;
}
