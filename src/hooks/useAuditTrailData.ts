/**
 * Hook para dados reais do Audit Trail
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  severity: "info" | "warning" | "critical";
  ipAddress: string;
  metadata?: Record<string, unknown>;
}

export interface AIInsight {
  id: string;
  type: "anomaly" | "pattern" | "recommendation" | "risk";
  title: string;
  description: string;
  confidence: number;
  affectedEntries: number;
  timestamp: Date;
}

export function useAuditEntries() {
  return useQuery({
    queryKey: ["audit-entries"],
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data, error } = await supabase
        .from("audit_trail")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        timestamp: new Date(row.timestamp),
        userId: row.user_id || "system",
        userName: row.user_email || "Sistema",
        action: row.action || "UNKNOWN",
        module: row.module || row.resource_type || "N/A",
        details: row.resource_name || (row.changes ? JSON.stringify(row.changes).slice(0, 100) : "Sem detalhes"),
        severity: mapSeverity(row.severity || row.action),
        ipAddress: row.ip_address ? String(row.ip_address) : "N/A",
        metadata: row.metadata as Record<string, unknown> | undefined,
      }));
    },
  });
}

export function useAIInsights() {
  return useQuery({
    queryKey: ["ai-audit-insights"],
    queryFn: async (): Promise<AIInsight[]> => {
      const { data, error } = await supabase
        .from("ai_access_anomalies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((row) => ({
        id: row.id,
        type: mapAnomalyType(row.anomaly_type),
        title: row.description || "Anomalia detectada",
        description: row.recommendation || "Sem descrição adicional",
        confidence: row.confidence || 0,
        affectedEntries: 1,
        timestamp: new Date(row.created_at),
      }));
    },
  });
}

function mapSeverity(value: string | null): "info" | "warning" | "critical" {
  if (!value) return "info";
  const v = value.toUpperCase();
  if (v === "CRITICAL" || v === "DELETE" || v.includes("PERMISSION")) return "critical";
  if (v === "WARNING" || v === "UPDATE" || v === "EXPORT") return "warning";
  return "info";
}

function mapAnomalyType(type: string | null): "anomaly" | "pattern" | "recommendation" | "risk" {
  if (!type) return "anomaly";
  const t = type.toLowerCase();
  if (t.includes("risk")) return "risk";
  if (t.includes("pattern")) return "pattern";
  if (t.includes("recommendation")) return "recommendation";
  return "anomaly";
}
