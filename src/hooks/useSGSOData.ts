/**
 * PATCH OPS-V7: Hooks para dados SGSO reais
 * Substitui SAMPLE_TRAININGS, SAMPLE_NCS, SAMPLE_INCIDENTS, etc.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// =====================================================
// TRAINING COMPLIANCE
// =====================================================

export interface TrainingRecord {
  id: string;
  name: string;
  category: "sgso" | "safety" | "environmental" | "operational" | "technical";
  status: "valid" | "expiring_soon" | "expired" | "pending";
  completionRate: number;
  certified: number;
  total: number;
  validityMonths: number;
  lastConducted?: string;
  nextDue?: string;
}

export function useTrainingComplianceData() {
  return useQuery({
    queryKey: ["sgso-training-compliance"],
    queryFn: async (): Promise<TrainingRecord[]> => {
      // Buscar de crew_training_records
      const { data: records, error } = await supabase
        .from("crew_training_records")
        .select(`
          id,
          training_name,
          training_type,
          completion_date,
          expiry_date,
          status,
          score,
          crew_members:crew_member_id (id)
        `)
        .order("expiry_date", { ascending: true })
        .limit(50);

      if (error || !records || records.length === 0) {
        return [];
      }

      // Agrupar por training_name e calcular estatísticas
      const groupedByTraining = new Map<string, typeof records>();
      
      records.forEach((rec) => {
        const key = rec.training_name || "Treinamento";
        if (!groupedByTraining.has(key)) {
          groupedByTraining.set(key, []);
        }
        groupedByTraining.get(key)!.push(rec);
      });

      return Array.from(groupedByTraining.entries()).map(([name, recs], idx) => {
        const total = recs.length;
        const certified = recs.filter(r => r.status === "completed" || r.status === "valid").length;
        const completionRate = total > 0 ? Math.round((certified / total) * 100) : 0;
        
        // Determinar status baseado nas datas de expiração
        const now = new Date();
        const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        
        let status: TrainingRecord["status"] = "valid";
        const expiringSoon = recs.some(r => r.expiry_date && new Date(r.expiry_date) <= thirtyDays && new Date(r.expiry_date) > now);
        const expired = recs.some(r => r.expiry_date && new Date(r.expiry_date) < now);
        
        if (expired) status = "expired";
        else if (expiringSoon) status = "expiring_soon";
        else if (completionRate < 50) status = "pending";

        const latestRecord = recs.sort((a, b) => 
          new Date(b.completion_date || 0).getTime() - new Date(a.completion_date || 0).getTime()
        )[0];

        return {
          id: `training-${idx}`,
          name,
          category: mapTrainingCategory(recs[0]?.training_type),
          status,
          completionRate,
          certified,
          total,
          validityMonths: 12,
          lastConducted: latestRecord?.completion_date || undefined,
          nextDue: latestRecord?.expiry_date || undefined,
        };
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =====================================================
// NON-CONFORMITIES
// =====================================================

export interface NonConformity {
  id: string;
  number: string;
  title: string;
  type: "major" | "minor" | "observation";
  practiceId: number;
  practiceName: string;
  status: "open" | "in_treatment" | "closed" | "verified";
  severity: "critical" | "high" | "medium" | "low";
  identifiedDate: string;
  dueDate: string;
  responsible: string;
  correctiveAction?: string;
  preventiveAction?: string;
  completionPercentage: number;
}

export function useNonConformityData() {
  return useQuery({
    queryKey: ["sgso-non-conformities"],
    queryFn: async (): Promise<NonConformity[]> => {
      const { data: ncs, error } = await supabase
        .from("non_conformities")
        .select(`
          id,
          title,
          description,
          severity,
          status,
          category,
          root_cause,
          corrective_action,
          preventive_action,
          created_at,
          due_date,
          reported_by,
          assigned_to,
          completion_percentage
        `)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error || !ncs || ncs.length === 0) {
        return [];
      }

      return ncs.map((nc, idx) => ({
        id: nc.id,
        number: `NC-${new Date(nc.created_at).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
        title: nc.title || "Não Conformidade",
        type: mapNCType(nc.severity),
        practiceId: 1,
        practiceName: nc.category || "Geral",
        status: mapNCStatus(nc.status),
        severity: mapSeverity(nc.severity),
        identifiedDate: nc.created_at || new Date().toISOString(),
        dueDate: nc.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        responsible: nc.assigned_to || nc.reported_by || "A definir",
        correctiveAction: nc.corrective_action || undefined,
        preventiveAction: nc.preventive_action || undefined,
        completionPercentage: nc.completion_percentage || 0,
      }));
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nc: Partial<NonConformity>) => {
      const { data, error } = await supabase
        .from("non_conformities")
        .insert({
          title: nc.title,
          description: nc.title,
          severity: nc.severity,
          status: "open",
          category: nc.practiceName,
          corrective_action: nc.correctiveAction,
          due_date: nc.dueDate,
          reported_by: nc.responsible,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sgso-non-conformities"] });
      toast.success("Não conformidade registrada com sucesso");
    },
    onError: () => {
      toast.error("Erro ao registrar não conformidade");
    },
  });
}

// =====================================================
// INCIDENTS (SGSO)
// =====================================================

export interface SGSOIncident {
  id: string;
  number: string;
  date: string;
  type: "accident" | "incident" | "near_miss" | "deviation";
  severity: "critical" | "high" | "medium" | "low";
  status: "reported" | "investigating" | "analyzed" | "closed";
  location: string;
  description: string;
  injuredCount: number;
  rootCause?: string;
  correctiveActions: string[];
  lessons?: string;
}

export function useSGSOIncidentsData() {
  return useQuery({
    queryKey: ["sgso-incidents"],
    queryFn: async (): Promise<SGSOIncident[]> => {
      const { data: alerts, error } = await supabase
        .from("soc_alerts")
        .select(`
          id,
          title,
          message,
          severity,
          alert_type,
          created_at,
          source_module,
          metadata,
          acknowledged_at,
          vessels:vessel_id (name)
        `)
        .or("source_module.ilike.%sgso%,source_module.ilike.%incident%,alert_type.ilike.%incident%")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error || !alerts || alerts.length === 0) {
        return [];
      }

      return alerts.map((alert, idx) => {
        const meta = (alert.metadata as Record<string, unknown>) || {};
        return {
          id: alert.id,
          number: `INC-${new Date(alert.created_at).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
          date: alert.created_at,
          type: mapIncidentType(alert.alert_type),
          severity: mapSeverity(alert.severity),
          status: alert.acknowledged_at ? "closed" as const : "reported" as const,
          location: (alert.vessels as { name: string } | null)?.name || "Local não especificado",
          description: alert.message || alert.title,
          injuredCount: (meta.injured_count as number) || 0,
          rootCause: (meta.root_cause as string) || undefined,
          correctiveActions: (meta.corrective_actions as string[]) || [],
          lessons: (meta.lessons as string) || undefined,
        };
      });
    },
    staleTime: 1000 * 60 * 3,
  });
}

// =====================================================
// CAPA (Corrective & Preventive Actions)
// =====================================================

export interface CAPARecord {
  id: string;
  number: string;
  type: "corrective" | "preventive";
  originType: "nc" | "incident" | "audit" | "observation";
  originId: string;
  title: string;
  status: "planned" | "in_progress" | "implemented" | "verified" | "closed";
  priority: "critical" | "high" | "medium" | "low";
  responsible: string;
  plannedDate: string;
  completionDate?: string;
  effectiveness?: "effective" | "partially_effective" | "not_effective";
  progress: number;
}

export function useCAPAData() {
  return useQuery({
    queryKey: ["sgso-capa"],
    queryFn: async (): Promise<CAPARecord[]> => {
      // Buscar ações corretivas/preventivas das non_conformities
      const { data: ncs, error } = await supabase
        .from("non_conformities")
        .select(`
          id,
          title,
          corrective_action,
          preventive_action,
          status,
          severity,
          assigned_to,
          due_date,
          completion_percentage,
          created_at
        `)
        .not("corrective_action", "is", null)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error || !ncs || ncs.length === 0) {
        return [];
      }

      const capas: CAPARecord[] = [];

      ncs.forEach((nc, idx) => {
        if (nc.corrective_action) {
          capas.push({
            id: `capa-c-${nc.id}`,
            number: `CAPA-C-${new Date(nc.created_at).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
            type: "corrective",
            originType: "nc",
            originId: nc.id,
            title: nc.corrective_action,
            status: mapCAPAStatus(nc.status, nc.completion_percentage),
            priority: mapSeverity(nc.severity),
            responsible: nc.assigned_to || "A definir",
            plannedDate: nc.due_date || new Date().toISOString(),
            progress: nc.completion_percentage || 0,
          });
        }

        if (nc.preventive_action) {
          capas.push({
            id: `capa-p-${nc.id}`,
            number: `CAPA-P-${new Date(nc.created_at).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
            type: "preventive",
            originType: "nc",
            originId: nc.id,
            title: nc.preventive_action,
            status: mapCAPAStatus(nc.status, nc.completion_percentage),
            priority: mapSeverity(nc.severity),
            responsible: nc.assigned_to || "A definir",
            plannedDate: nc.due_date || new Date().toISOString(),
            progress: nc.completion_percentage || 0,
          });
        }
      });

      return capas;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =====================================================
// AUDIT PLANNER
// =====================================================

export interface AuditPlan {
  id: string;
  number: string;
  type: "internal" | "external" | "certification" | "surveillance";
  scope: string;
  auditDate: string;
  duration: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  leadAuditor: string;
  team: string[];
  practices: number[];
  findingsCount?: number;
  ncMajor?: number;
  ncMinor?: number;
  observations?: number;
}

export function useAuditPlannerData() {
  return useQuery({
    queryKey: ["sgso-audit-planner"],
    queryFn: async (): Promise<AuditPlan[]> => {
      const { data: audits, error } = await supabase
        .from("audits")
        .select(`
          id,
          title,
          audit_type,
          scheduled_date,
          status,
          lead_auditor,
          scope,
          findings_count,
          nc_major,
          nc_minor,
          observations,
          created_at
        `)
        .order("scheduled_date", { ascending: false })
        .limit(20);

      if (error || !audits || audits.length === 0) {
        return [];
      }

      return audits.map((audit, idx) => ({
        id: audit.id,
        number: `AUD-${new Date(audit.scheduled_date || audit.created_at).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
        type: mapAuditType(audit.audit_type),
        scope: audit.scope || audit.title || "Auditoria SGSO",
        auditDate: audit.scheduled_date || audit.created_at,
        duration: 2,
        status: mapAuditStatus(audit.status),
        leadAuditor: audit.lead_auditor || "A definir",
        team: [],
        practices: [1, 2, 3, 4, 5],
        findingsCount: audit.findings_count || 0,
        ncMajor: audit.nc_major || 0,
        ncMinor: audit.nc_minor || 0,
        observations: audit.observations || 0,
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapTrainingCategory(type: string | null): TrainingRecord["category"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("sgso")) return "sgso";
  if (lower.includes("safety") || lower.includes("segur")) return "safety";
  if (lower.includes("env") || lower.includes("ambiental")) return "environmental";
  if (lower.includes("oper")) return "operational";
  return "technical";
}

function mapNCType(severity: string | null): NonConformity["type"] {
  const lower = severity?.toLowerCase() || "";
  if (lower.includes("critical") || lower.includes("high")) return "major";
  if (lower.includes("medium")) return "minor";
  return "observation";
}

function mapNCStatus(status: string | null): NonConformity["status"] {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("closed") || lower.includes("resolved")) return "closed";
  if (lower.includes("verified")) return "verified";
  if (lower.includes("progress") || lower.includes("treatment")) return "in_treatment";
  return "open";
}

function mapSeverity(severity: string | null): "critical" | "high" | "medium" | "low" {
  const lower = severity?.toLowerCase() || "";
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium") || lower.includes("moderate")) return "medium";
  return "low";
}

function mapIncidentType(type: string | null): SGSOIncident["type"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("accident")) return "accident";
  if (lower.includes("near") || lower.includes("miss")) return "near_miss";
  if (lower.includes("deviation")) return "deviation";
  return "incident";
}

function mapCAPAStatus(status: string | null, completion: number | null): CAPARecord["status"] {
  if (completion && completion >= 100) return "closed";
  if (completion && completion > 0) return "in_progress";
  
  const lower = status?.toLowerCase() || "";
  if (lower.includes("closed") || lower.includes("resolved")) return "closed";
  if (lower.includes("verified")) return "verified";
  if (lower.includes("progress")) return "in_progress";
  return "planned";
}

function mapAuditType(type: string | null): AuditPlan["type"] {
  const lower = type?.toLowerCase() || "";
  if (lower.includes("extern")) return "external";
  if (lower.includes("certif")) return "certification";
  if (lower.includes("surv")) return "surveillance";
  return "internal";
}

function mapAuditStatus(status: string | null): AuditPlan["status"] {
  const lower = status?.toLowerCase() || "";
  if (lower.includes("complet") || lower.includes("done")) return "completed";
  if (lower.includes("progress")) return "in_progress";
  if (lower.includes("cancel")) return "cancelled";
  return "planned";
}
