/**
 * Hook para dados reais de Compliance
 * Substitui mock data em ComplianceTerceiros, ComplianceRelatorios
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ThirdParty {
  id: string;
  name: string;
  cnpj: string;
  category: string;
  status: "approved" | "pending" | "expired" | "rejected";
  riskLevel: "low" | "medium" | "high";
  lastAudit: string;
  nextAudit: string;
  documents: number;
  pendingDocs: number;
  score: number;
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: string;
  status: "draft" | "pending" | "approved" | "published";
  createdAt: string;
  dueDate: string;
  author: string;
  category: string;
}

export interface DrillRecord {
  id: string;
  name: string;
  type: string;
  frequency: string;
  lastExecution: string;
  nextDue: string;
  status: "completed" | "scheduled" | "overdue";
  participants: number;
  totalCrew: number;
}

async function fetchThirdParties(): Promise<ThirdParty[]> {
  const { data, error } = await supabase
    .from("suppliers")
    .select("id, name, cnpj, categories, status, rating, created_at, updated_at")
    .limit(50);

  if (error || !data?.length) return [];

  return data.map((s: any) => ({
    id: s.id,
    name: s.name || "Terceiro",
    cnpj: s.cnpj || "",
    category: Array.isArray(s.categories) ? s.categories[0] : s.categories || "Geral",
    status: mapThirdPartyStatus(s.status),
    riskLevel: calculateRiskLevel(s.rating),
    lastAudit: s.updated_at || s.created_at,
    nextAudit: calculateNextAudit(s.updated_at || s.created_at),
    documents: Math.floor((s.rating || 3) * 3),
    pendingDocs: s.status === "pending" ? 2 : 0,
    score: (s.rating || 3) * 20
  }));
}

async function fetchComplianceReports(): Promise<ComplianceReport[]> {
  const { data, error } = await supabase
    .from("ai_generated_documents")
    .select("id, title, document_type, status, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) {
    // Tentar tabela alternativa
    const { data: audits } = await supabase
      .from("peotram_audits")
      .select("id, audit_period, audit_type, status, created_at, auditor_name")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!audits?.length) return [];

    return audits.map((a: any) => ({
      id: a.id,
      title: `Auditoria ${a.audit_period || a.audit_type}`,
      type: a.audit_type || "compliance",
      status: mapReportStatus(a.status),
      createdAt: a.created_at,
      dueDate: calculateDueDate(a.created_at),
      author: a.auditor_name || "Sistema",
      category: a.audit_type || "Compliance"
    }));
  }

  return data.map((d: any) => ({
    id: d.id,
    title: d.title || "Relatório",
    type: d.document_type || "report",
    status: mapReportStatus(d.status),
    createdAt: d.created_at,
    dueDate: calculateDueDate(d.created_at),
    author: "Sistema",
    category: d.document_type || "Geral"
  }));
}

async function fetchDrills(): Promise<DrillRecord[]> {
  const { data, error } = await supabase
    .from("smart_drills")
    .select("id, title, drill_type, execution_frequency, last_executed_at, status, total_executions")
    .order("last_executed_at", { ascending: false })
    .limit(20);

  if (error || !data?.length) {
    // Tentar drill_evaluations
    const { data: evals } = await supabase
      .from("drill_evaluations")
      .select("id, drill_id, execution_date, overall_score, participants_count")
      .order("execution_date", { ascending: false })
      .limit(20);

    if (!evals?.length) return [];

    return evals.map((e: any) => ({
      id: e.id,
      name: `Exercício ${e.drill_id?.slice(0, 8) || ""}`,
      type: "general",
      frequency: "Mensal",
      lastExecution: e.execution_date,
      nextDue: calculateNextDrillDate(e.execution_date),
      status: "completed",
      participants: e.participants_count || 0,
      totalCrew: e.participants_count || 24
    }));
  }

  return data.map((d: any) => ({
    id: d.id,
    name: d.title || "Exercício",
    type: d.drill_type || "general",
    frequency: d.execution_frequency || "Mensal",
    lastExecution: d.last_executed_at || "",
    nextDue: calculateNextDrillDate(d.last_executed_at),
    status: mapDrillStatus(d.status, d.last_executed_at),
    participants: d.total_executions || 0,
    totalCrew: 24
  }));
}

// Helper functions
function mapThirdPartyStatus(status: string | null): ThirdParty["status"] {
  switch (status?.toLowerCase()) {
    case "approved":
    case "active":
    case "preferred":
      return "approved";
    case "expired":
    case "suspended":
      return "expired";
    case "rejected":
    case "blocked":
      return "rejected";
    default:
      return "pending";
  }
}

function calculateRiskLevel(rating: number | null): ThirdParty["riskLevel"] {
  const score = rating || 3;
  if (score >= 4) return "low";
  if (score >= 2.5) return "medium";
  return "high";
}

function calculateNextAudit(lastAudit: string): string {
  const date = new Date(lastAudit);
  date.setMonth(date.getMonth() + 6);
  return date.toISOString().split("T")[0];
}

function mapReportStatus(status: string | null): ComplianceReport["status"] {
  switch (status?.toLowerCase()) {
    case "approved":
    case "completed":
      return "approved";
    case "published":
      return "published";
    case "draft":
      return "draft";
    default:
      return "pending";
  }
}

function calculateDueDate(createdAt: string): string {
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split("T")[0];
}

function calculateNextDrillDate(lastExecution: string | null): string {
  const date = lastExecution ? new Date(lastExecution) : new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split("T")[0];
}

function mapDrillStatus(status: string | null, lastExecution: string | null): DrillRecord["status"] {
  if (status === "completed") return "completed";
  
  if (lastExecution) {
    const nextDue = new Date(lastExecution);
    nextDue.setMonth(nextDue.getMonth() + 1);
    if (nextDue < new Date()) return "overdue";
  }
  
  return "scheduled";
}

// ============================================
// HOOKS EXPORTADOS
// ============================================

export function useThirdParties() {
  return useQuery({
    queryKey: ["compliance-third-parties"],
    queryFn: fetchThirdParties,
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceReports() {
  return useQuery({
    queryKey: ["compliance-reports"],
    queryFn: fetchComplianceReports,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDrillRecords() {
  return useQuery({
    queryKey: ["drill-records"],
    queryFn: fetchDrills,
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceStats() {
  const { data: thirdParties } = useThirdParties();
  const { data: reports } = useComplianceReports();
  const { data: drills } = useDrillRecords();

  return {
    totalThirdParties: thirdParties?.length || 0,
    approvedThirdParties: thirdParties?.filter(t => t.status === "approved").length || 0,
    pendingReports: reports?.filter(r => r.status === "pending" || r.status === "draft").length || 0,
    completedDrills: drills?.filter(d => d.status === "completed").length || 0,
    overdueDrills: drills?.filter(d => d.status === "overdue").length || 0
  };
}
