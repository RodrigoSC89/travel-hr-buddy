/**
 * PATCH OPS-V7: Hook para Audit Log
 * Integra com tabela immutable_audit_logs
 * ISM/ISPS Ready - logs imutáveis
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AuditLogEntry {
  id: string;
  createdAt: string;
  correlationId?: string;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  dataBefore?: Record<string, unknown>;
  dataAfter?: Record<string, unknown>;
  dataDiff?: Record<string, unknown>;
  sourceModule?: string;
  complianceCategory?: string;
  checksum?: string;
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
      // Calcular diff se tiver before e after
      let dataDiff: Record<string, unknown> | undefined;
      if (params.dataBefore && params.dataAfter) {
        dataDiff = calculateDiff(params.dataBefore, params.dataAfter);
      }

      // Calcular checksum
      const checksum = await generateChecksum(
        params.action,
        params.entityType,
        params.entityId,
        params.dataBefore,
        params.dataAfter
      );

      const { data, error } = await supabase
        .from("immutable_audit_logs")
        .insert({
          actor_id: user?.id,
          actor_email: user?.email,
          action: params.action,
          entity_type: params.entityType,
          entity_id: params.entityId,
          entity_name: params.entityName,
          data_before: params.dataBefore,
          data_after: params.dataAfter,
          data_diff: dataDiff,
          source_module: params.sourceModule,
          compliance_category: params.complianceCategory || "GENERAL",
          checksum,
        })
        .select("id")
        .single();

      if (error) throw error;
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
        .from("immutable_audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.entityType) {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters?.entityId) {
        query = query.eq("entity_id", filters.entityId);
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
        // Tabela pode não existir ainda
        if (error.message?.includes("does not exist")) {
          return [];
        }
        throw error;
      }

      return (data || []).map((log) => ({
        id: log.id,
        createdAt: log.created_at,
        correlationId: log.correlation_id,
        actorId: log.actor_id,
        actorEmail: log.actor_email,
        actorRole: log.actor_role,
        action: log.action,
        entityType: log.entity_type,
        entityId: log.entity_id,
        entityName: log.entity_name,
        dataBefore: log.data_before as Record<string, unknown>,
        dataAfter: log.data_after as Record<string, unknown>,
        dataDiff: log.data_diff as Record<string, unknown>,
        sourceModule: log.source_module,
        complianceCategory: log.compliance_category,
        checksum: log.checksum,
      }));
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
      // Buscar dados anteriores se for UPDATE ou DELETE
      let dataBefore: Record<string, unknown> | undefined;
      if (options.getDataBefore && (options.action === "UPDATE" || options.action === "DELETE")) {
        dataBefore = await options.getDataBefore(variables);
      }

      // Executar a mutation principal
      const result = await mutationFn(variables);

      // Criar audit log
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

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function calculateDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  // Campos adicionados ou modificados
  for (const key of Object.keys(after)) {
    if (!(key in before)) {
      diff[key] = { added: after[key] };
    } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diff[key] = { old: before[key], new: after[key] };
    }
  }

  // Campos removidos
  for (const key of Object.keys(before)) {
    if (!(key in after)) {
      diff[key] = { removed: before[key] };
    }
  }

  return diff;
}

async function generateChecksum(
  action: string,
  entityType: string,
  entityId?: string,
  dataBefore?: Record<string, unknown>,
  dataAfter?: Record<string, unknown>
): Promise<string> {
  const payload = JSON.stringify({
    action,
    entityType,
    entityId,
    dataBefore,
    dataAfter,
    timestamp: new Date().toISOString(),
  });

  // Usar crypto para gerar hash
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback simples
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
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
    "Usuário",
    "Módulo",
    "Categoria Compliance",
    "Checksum",
  ];

  const rows = logs.map((log) => [
    log.id,
    new Date(log.createdAt).toLocaleString("pt-BR"),
    log.action,
    log.entityType,
    log.entityId || "",
    log.actorEmail || "",
    log.sourceModule || "",
    log.complianceCategory || "",
    log.checksum || "",
  ]);

  const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");

  return csvContent;
}
