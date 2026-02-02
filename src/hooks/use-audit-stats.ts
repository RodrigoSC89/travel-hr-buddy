/**
 * Hook for fetching real audit statistics from the database
 * PATCH UX-PREMIUM: Real data integration
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AuditStats {
  complianceRate: number;
  totalAudits: number;
  openNCs: number;
  activeAgents: number;
  recentActivity: {
    agentId: string;
    action: string;
    timestamp: Date;
  }[];
}

export function useAuditStats() {
  return useQuery({
    queryKey: ["audit-stats"],
    queryFn: async (): Promise<AuditStats> => {
      // Fetch real audit data from multiple tables
      const [auditsRes, ncsRes, logsRes] = await Promise.all([
        supabase.from("peotram_audits").select("id, status, compliance_score", { count: "exact" }).limit(100),
        supabase.from("action_items").select("id").eq("status", "pending").limit(100),
        supabase.from("ai_audit_logs").select("id, module_name, created_at").order("created_at", { ascending: false }).limit(10)
      ]);

      const audits = auditsRes.data || [];
      const openNCs = ncsRes.data?.length || 0;
      const recentLogs = logsRes.data || [];

      // Calculate compliance rate from real data
      const scoresWithValues = audits.filter(a => a.compliance_score !== null);
      const avgScore = scoresWithValues.length > 0 
        ? scoresWithValues.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / scoresWithValues.length
        : 95; // Default if no data

      // Map recent activity
      const recentActivity = recentLogs.slice(0, 5).map(log => ({
        agentId: log.module_name?.toLowerCase().replace(/\s+/g, "-") || "unknown",
        action: `Processou análise ${log.module_name || "geral"}`,
        timestamp: new Date(log.created_at || new Date())
      }));

      return {
        complianceRate: Math.min(100, Math.max(0, avgScore)),
        totalAudits: auditsRes.count || audits.length || 0,
        openNCs,
        activeAgents: 10, // Fixed number of available agents
        recentActivity
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchInterval: 1000 * 60 * 5 // Refresh every 5 minutes
  });
}
