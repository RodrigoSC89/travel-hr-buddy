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
      try {
        // Buscar de crew_training_records using any cast
        const { data: records, error } = await (supabase as any)
          .from("crew_training_records")
          .select(`
            id,
            training_name,
            training_type,
            completion_date,
            expiry_date,
            status,
            score,
            crew_member_id
          `)
          .order("expiry_date", { ascending: true })
          .limit(50);

        if (error || !records || records.length === 0) {
          return [];
        }

        // Agrupar por training_name e calcular estatísticas
        const groupedByTraining = new Map<string, Record<string, unknown>[]>();
        
        (records as Record<string, unknown>[]).forEach((rec) => {
          const key = String(rec.training_name || "Treinamento");
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
          const expiringSoon = recs.some(r => r.expiry_date && new Date(String(r.expiry_date)) <= thirtyDays && new Date(String(r.expiry_date)) > now);
          const expired = recs.some(r => r.expiry_date && new Date(String(r.expiry_date)) < now);
          
          if (expired) status = "expired";
          else if (expiringSoon) status = "expiring_soon";
          else if (completionRate < 50) status = "pending";

          const latestRecord = recs.sort((a, b) => 
            new Date(String(b.completion_date || 0)).getTime() - new Date(String(a.completion_date || 0)).getTime()
          )[0];

          return {
            id: `training-${idx}`,
            name,
            category: mapTrainingCategory(String(recs[0]?.training_type || "")),
            status,
            completionRate,
            certified,
            total,
            validityMonths: 12,
            lastConducted: latestRecord?.completion_date ? String(latestRecord.completion_date) : undefined,
            nextDue: latestRecord?.expiry_date ? String(latestRecord.expiry_date) : undefined,
          };
        });
      } catch {
        return [];
      }
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
      try {
        const { data: ncs, error } = await (supabase as any)
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
            assigned_to
          `)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error || !ncs || ncs.length === 0) {
          return [];
        }

        return (ncs as Record<string, unknown>[]).map((nc, idx) => ({
          id: String(nc.id || ''),
          number: `NC-${new Date(String(nc.created_at || new Date())).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
          title: String(nc.title || "Não Conformidade"),
          type: mapNCType(String(nc.severity || '')),
          practiceId: 1,
          practiceName: String(nc.category || "Geral"),
          status: mapNCStatus(String(nc.status || '')),
          severity: mapSeverity(String(nc.severity || '')),
          identifiedDate: String(nc.created_at || new Date().toISOString()),
          dueDate: String(nc.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()),
          responsible: String(nc.assigned_to || nc.reported_by || "A definir"),
          correctiveAction: nc.corrective_action ? String(nc.corrective_action) : undefined,
          preventiveAction: nc.preventive_action ? String(nc.preventive_action) : undefined,
          completionPercentage: 0,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 3,
  });
}

export function useCreateNonConformity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (nc: Partial<NonConformity>) => {
      const { data, error } = await (supabase as any)
        .from("non_conformities")
        .insert({
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
      try {
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
      } catch {
        return [];
      }
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
      try {
        // Buscar ações corretivas/preventivas das non_conformities
        const { data: ncs, error } = await (supabase as any)
          .from("non_conformities")
          .select(`
            id,
            description,
            corrective_action,
            preventive_action,
            status,
            severity,
            assigned_to,
            due_date,
            created_at
          `)
          .not("corrective_action", "is", null)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error || !ncs || ncs.length === 0) {
          return [];
        }

        const capas: CAPARecord[] = [];

        (ncs as Record<string, unknown>[]).forEach((nc, idx) => {
          if (nc.corrective_action) {
            capas.push({
              id: `capa-c-${nc.id}`,
              number: `CAPA-C-${new Date(String(nc.created_at || new Date())).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
              type: "corrective",
              originType: "nc",
              originId: String(nc.id || ''),
              title: String(nc.corrective_action || ''),
              status: mapCAPAStatus(String(nc.status || ''), 0),
              priority: mapSeverity(String(nc.severity || '')),
              responsible: String(nc.assigned_to || "A definir"),
              plannedDate: String(nc.due_date || new Date().toISOString()),
              progress: 0,
            });
          }

          if (nc.preventive_action) {
            capas.push({
              id: `capa-p-${nc.id}`,
              number: `CAPA-P-${new Date(String(nc.created_at || new Date())).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
              type: "preventive",
              originType: "nc",
              originId: String(nc.id || ''),
              title: String(nc.preventive_action || ''),
              status: mapCAPAStatus(String(nc.status || ''), 0),
              priority: mapSeverity(String(nc.severity || '')),
              responsible: String(nc.assigned_to || "A definir"),
              plannedDate: String(nc.due_date || new Date().toISOString()),
              progress: 0,
            });
          }
        });

        return capas;
      } catch {
        return [];
      }
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
      try {
        const { data: audits, error } = await (supabase as any)
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

        return (audits as Record<string, unknown>[]).map((audit, idx) => ({
          id: String(audit.id || ''),
          number: `AUD-${new Date(String(audit.scheduled_date || audit.created_at || new Date())).getFullYear()}-${String(idx + 1).padStart(3, "0")}`,
          type: mapAuditType(String(audit.audit_type || '')),
          scope: String(audit.scope || audit.title || "Auditoria SGSO"),
          auditDate: String(audit.scheduled_date || audit.created_at || new Date().toISOString()),
          duration: 2,
          status: mapAuditStatus(String(audit.status || '')),
          leadAuditor: String(audit.lead_auditor || "A definir"),
          team: [],
          practices: [1, 2, 3, 4, 5],
          findingsCount: Number(audit.findings_count) || 0,
          ncMajor: Number(audit.nc_major) || 0,
          ncMinor: Number(audit.nc_minor) || 0,
          observations: Number(audit.observations) || 0,
        }));
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function mapTrainingCategory(type: string): TrainingRecord["category"] {
  const lower = type.toLowerCase();
  if (lower.includes("sgso")) return "sgso";
  if (lower.includes("safety") || lower.includes("segur")) return "safety";
  if (lower.includes("env") || lower.includes("ambiental")) return "environmental";
  if (lower.includes("oper")) return "operational";
  return "technical";
}

function mapNCType(severity: string): NonConformity["type"] {
  const lower = severity.toLowerCase();
  if (lower.includes("critical") || lower.includes("high")) return "major";
  if (lower.includes("medium")) return "minor";
  return "observation";
}

function mapNCStatus(status: string): NonConformity["status"] {
  const lower = status.toLowerCase();
  if (lower.includes("closed") || lower.includes("resolved")) return "closed";
  if (lower.includes("verified")) return "verified";
  if (lower.includes("progress") || lower.includes("treatment")) return "in_treatment";
  return "open";
}

function mapSeverity(severity: string): "critical" | "high" | "medium" | "low" {
  const lower = severity.toLowerCase();
  if (lower.includes("critical")) return "critical";
  if (lower.includes("high")) return "high";
  if (lower.includes("medium") || lower.includes("moderate")) return "medium";
  return "low";
}

function mapIncidentType(type: string | null): SGSOIncident["type"] {
  const lower = (type || "").toLowerCase();
  if (lower.includes("accident")) return "accident";
  if (lower.includes("near") || lower.includes("miss")) return "near_miss";
  if (lower.includes("deviation")) return "deviation";
  return "incident";
}

function mapCAPAStatus(status: string, completion: number): CAPARecord["status"] {
  if (completion >= 100) return "closed";
  if (completion > 0) return "in_progress";
  
  const lower = status.toLowerCase();
  if (lower.includes("closed") || lower.includes("resolved")) return "closed";
  if (lower.includes("verified")) return "verified";
  if (lower.includes("progress")) return "in_progress";
  return "planned";
}

function mapAuditType(type: string | null): AuditPlan["type"] {
  const lower = (type || "").toLowerCase();
  if (lower.includes("extern")) return "external";
  if (lower.includes("certif")) return "certification";
  if (lower.includes("surv")) return "surveillance";
  return "internal";
}

function mapAuditStatus(status: string | null): AuditPlan["status"] {
  const lower = (status || "").toLowerCase();
  if (lower.includes("complet") || lower.includes("done")) return "completed";
  if (lower.includes("progress")) return "in_progress";
  if (lower.includes("cancel")) return "cancelled";
  return "planned";
}
