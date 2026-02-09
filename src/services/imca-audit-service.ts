/**
 * IMCA Audit Service
 * DEBT-FIX: auditorias_imca doesn't exist in schema.
 * Using localStorage persistence for audit reports.
 */
import { supabase } from "@/integrations/supabase/client";
import type { IMCAAuditReport, IMCAAuditInput } from "@/types/imca-audit";
import { logger } from "@/lib/logger";

const STORAGE_KEY = "nautilus_imca_audits";

function loadAudits(): Array<{ id: string; user_id: string; report_data: IMCAAuditReport; created_at: string; updated_at: string }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAuditsToStorage(audits: Array<{ id: string; user_id: string; report_data: IMCAAuditReport; created_at: string; updated_at: string }>): void {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(audits)); } catch {}
}

export async function generateIMCAAudit(input: IMCAAuditInput): Promise<IMCAAuditReport> {
  try {
    const { data, error } = await supabase.functions.invoke("imca-audit-generator", { body: input });
    if (error) throw error;
    return data;
  } catch (error) {
    logger.error("Error generating IMCA audit", error as Error, { input });
    throw error;
  }
}

export async function saveAudit(report: IMCAAuditReport): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const id = crypto.randomUUID();
  const audits = loadAudits();
  audits.push({
    id,
    user_id: user.id,
    report_data: report,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  saveAuditsToStorage(audits);
  return id;
}

export async function getAudits(): Promise<IMCAAuditReport[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  return loadAudits()
    .filter(a => a.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map(row => ({ ...row.report_data, id: row.id }));
}

export async function getAudit(id: string): Promise<IMCAAuditReport | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const audit = loadAudits().find(a => a.id === id && a.user_id === user.id);
  if (!audit) return null;
  return { ...audit.report_data, id: audit.id };
}

export async function updateAudit(id: string, report: Partial<IMCAAuditReport>): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const audits = loadAudits();
  const idx = audits.findIndex(a => a.id === id && a.user_id === user.id);
  if (idx === -1) return false;

  audits[idx].report_data = { ...audits[idx].report_data, ...report };
  audits[idx].updated_at = new Date().toISOString();
  saveAuditsToStorage(audits);
  return true;
}

export async function deleteAudit(id: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const audits = loadAudits();
  const filtered = audits.filter(a => !(a.id === id && a.user_id === user.id));
  if (filtered.length === audits.length) return false;
  saveAuditsToStorage(filtered);
  return true;
}

export async function exportAuditMarkdown(report: IMCAAuditReport): Promise<Blob> {
  const { formatAuditAsMarkdown } = await import("@/types/imca-audit");
  const markdown = formatAuditAsMarkdown(report);
  return new Blob([markdown], { type: "text/markdown" });
}

export function downloadAuditMarkdown(report: IMCAAuditReport, filename?: string): void {
  import("@/types/imca-audit").then(({ formatAuditAsMarkdown }) => {
    const markdown = formatAuditAsMarkdown(report);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `IMCA_Audit_${report.vesselName}_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}
