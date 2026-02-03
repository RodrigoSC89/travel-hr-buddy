/**
 * Hook para dados reais do Compliance Integration Hub
 * Substitui INTEGRATION_STATUS e RECENT_ACTIVITIES mockados
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { IntegrationStatus } from "@/lib/integration-status";

export interface SystemIntegration {
  system: string;
  status: IntegrationStatus;
  lastSync: string;
  records: number | null;
}

export interface RecentActivity {
  id: string;
  action: string;
  item: string;
  module: string;
  time: string;
  type: "nc" | "evidence" | "report" | "audit" | "action";
}

/**
 * Fetch integration status from system_status table
 */
export function useIntegrationStatus() {
  return useQuery({
    queryKey: ["compliance-integration-status"],
    queryFn: async (): Promise<SystemIntegration[]> => {
      const { data, error } = await supabase
        .from("system_status")
        .select("*")
        .order("last_check", { ascending: false });

      if (error) throw error;

      // Map to integration format
      const integrations: SystemIntegration[] = [];

      // Check PEOTRAM
      const peotramStatus = data?.find((s) => s.service_name === "PEOTRAM");
      const { count: peotramCount } = await supabase
        .from("peotram_audits_2024")
        .select("*", { count: "exact", head: true });

      integrations.push({
        system: "PEOTRAM",
        status: peotramStatus?.status === "healthy" ? "CONNECTED" : "DISCONNECTED",
        lastSync: peotramStatus?.last_check
          ? formatTimeAgo(new Date(peotramStatus.last_check))
          : "N/A",
        records: peotramCount || 0,
      });

      // Check PEO-DP
      const peodpStatus = data?.find((s) => s.service_name === "PEO-DP");
      const { count: peodpCount } = await supabase
        .from("dp_incidents")
        .select("*", { count: "exact", head: true });

      integrations.push({
        system: "PEO-DP",
        status: peodpStatus?.status === "healthy" ? "CONNECTED" : "DISCONNECTED",
        lastSync: peodpStatus?.last_check
          ? formatTimeAgo(new Date(peodpStatus.last_check))
          : "N/A",
        records: peodpCount || 0,
      });

      // Supabase is always connected if we got here
      const { count: totalRecords } = await supabase
        .from("audit_log")
        .select("*", { count: "exact", head: true });

      integrations.push({
        system: "Supabase",
        status: "CONNECTED",
        lastSync: "Real-time",
        records: totalRecords || 0,
      });

      // Email/AI are on-demand
      integrations.push({
        system: "Email (Resend)",
        status: "CONNECTED",
        lastSync: "On-demand",
        records: null,
      });

      integrations.push({
        system: "AI (GPT-4o)",
        status: "CONNECTED",
        lastSync: "On-demand",
        records: null,
      });

      return integrations;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Fetch recent compliance activities from multiple tables
 */
export function useRecentActivities() {
  return useQuery({
    queryKey: ["compliance-recent-activities"],
    queryFn: async (): Promise<RecentActivity[]> => {
      const activities: RecentActivity[] = [];

      // Fetch recent non-conformities
      const { data: ncs } = await supabase
        .from("non_conformities")
        .select("id, title, status, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(5);

      ncs?.forEach((nc) => {
        activities.push({
          id: nc.id,
          action: nc.status === "closed" ? "NC Fechada" : "NC Aberta",
          item: nc.title || `NC-${nc.id.slice(0, 8)}`,
          module: "SGSO",
          time: formatTimeAgo(new Date(nc.updated_at || nc.created_at || new Date())),
          type: "nc",
        });
      });

      // Fetch recent SGSO audits
      const { data: audits } = await supabase
        .from("sgso_audits")
        .select("id, audit_type, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      audits?.forEach((audit) => {
        activities.push({
          id: audit.id,
          action: audit.status === "completed" ? "Auditoria Concluída" : "Auditoria Iniciada",
          item: `AUD-${audit.id.slice(0, 8)}`,
          module: audit.audit_type || "SGSO",
          time: formatTimeAgo(new Date(audit.created_at || new Date())),
          type: "audit",
        });
      });

      // Fetch recent action items
      const { data: actions } = await supabase
        .from("action_items")
        .select("id, title, status, source_module, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      actions?.forEach((action) => {
        activities.push({
          id: action.id,
          action: action.status === "completed" ? "Ação Concluída" : "Ação Criada",
          item: action.title || `ACT-${action.id.slice(0, 8)}`,
          module: action.source_module || "Compliance",
          time: formatTimeAgo(new Date(action.created_at || new Date())),
          type: "action",
        });
      });

      // Sort by time (most recent first) and limit
      return activities
        .sort((a, b) => {
          // Simple sort - items with "min" come before "h" come before "d"
          const getMinutes = (time: string): number => {
            if (time.includes("agora")) return 0;
            if (time.includes("min")) return parseInt(time) || 1;
            if (time.includes("h")) return (parseInt(time) || 1) * 60;
            if (time.includes("d")) return (parseInt(time) || 1) * 1440;
            return 9999;
          };
          return getMinutes(a.time) - getMinutes(b.time);
        })
        .slice(0, 8);
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Format date to "X min atrás" format
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "agora";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
}

/**
 * Compliance stats from real data
 */
export function useComplianceStats() {
  return useQuery({
    queryKey: ["compliance-stats"],
    queryFn: async () => {
      // Count total non-conformities
      const { count: totalNCs } = await supabase
        .from("non_conformities")
        .select("*", { count: "exact", head: true });

      // Count open NCs
      const { count: openNCs } = await supabase
        .from("non_conformities")
        .select("*", { count: "exact", head: true })
        .neq("status", "closed");

      // Count total audits
      const { count: totalAudits } = await supabase
        .from("sgso_audits")
        .select("*", { count: "exact", head: true });

      // Count pending actions
      const { count: pendingActions } = await supabase
        .from("action_items")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");

      // Calculate compliance rate
      const closedNCs = (totalNCs || 0) - (openNCs || 0);
      const complianceRate = totalNCs ? Math.round((closedNCs / totalNCs) * 100) : 100;

      return {
        totalNCs: totalNCs || 0,
        openNCs: openNCs || 0,
        totalAudits: totalAudits || 0,
        pendingActions: pendingActions || 0,
        complianceRate,
      };
    },
    staleTime: 60000,
  });
}
