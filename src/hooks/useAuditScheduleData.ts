/**
 * Hook para dados de Agendamento de Auditoria - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface AuditMetadata {
  title?: string;
  audit_type?: string;
  vessel_name?: string;
  status?: string;
  auditor_name?: string;
  scope?: string[];
  findings_count?: number;
  observations_count?: number;
}

export interface AuditSchedule {
  id: string;
  title: string;
  type: "internal" | "external" | "psc" | "vetting" | "flag_state";
  vessel: string;
  scheduledDate: Date;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  auditor: string;
  scope: string[];
  findings?: number;
  observations?: number;
}

function parseMetadata(raw: Json | null): AuditMetadata {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as unknown as AuditMetadata;
}

export function useAuditSchedules(vesselId?: string) {
  return useQuery({
    queryKey: ["audit-schedules", vesselId],
    queryFn: async (): Promise<AuditSchedule[]> => {
      const { data, error } = await supabase
        .from("audit_log")
        .select("*")
        .eq("entity_type", "audit")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map((log) => {
        const metadata = parseMetadata(log.metadata);
        
        return {
          id: log.id,
          title: metadata.title || log.action || "Auditoria",
          type: (metadata.audit_type as AuditSchedule["type"]) || "internal",
          vessel: metadata.vessel_name || "MV Atlantic Star",
          scheduledDate: new Date(log.event_timestamp || log.created_at || Date.now()),
          status: (metadata.status as AuditSchedule["status"]) || "scheduled",
          auditor: metadata.auditor_name || "Auditor",
          scope: metadata.scope || [],
          findings: metadata.findings_count,
          observations: metadata.observations_count,
        };
      });
    },
    staleTime: 30000,
  });
}

export function useAuditStats() {
  const { data: audits } = useAuditSchedules();

  return {
    totalScheduled: audits?.filter((a) => a.status === "scheduled").length || 0,
    inProgress: audits?.filter((a) => a.status === "in_progress").length || 0,
    completed: audits?.filter((a) => a.status === "completed").length || 0,
    overdue: audits?.filter((a) => a.status === "overdue").length || 0,
    totalFindings: audits?.reduce((acc, a) => acc + (a.findings || 0), 0) || 0,
  };
}

export function useCreateAudit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (audit: Omit<AuditSchedule, "id">) => {
      const { data, error } = await supabase
        .from("audit_log")
        .insert({
          entity_type: "audit",
          entity_id: crypto.randomUUID(),
          action: "audit_scheduled",
          module: "compliance",
          metadata: {
            title: audit.title,
            audit_type: audit.type,
            vessel_name: audit.vessel,
            status: audit.status,
            auditor_name: audit.auditor,
            scope: audit.scope,
          } as unknown as Json,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-schedules"] });
      toast.success("Auditoria agendada com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao agendar auditoria: " + error.message);
    },
  });
}
