/**
 * Hook: Security Scanner - Real data from telemetry_alerts + compliance checks
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFixSecurityFinding } from "@/hooks/useModuleHooks";

interface SecurityFinding {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  description: string;
  status: "open" | "fixed" | "ignored";
}

export function useSecurityScanData() {

  const { data: findings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["security-findings"],
    queryFn: async (): Promise<SecurityFinding[]> => {
      // Pull real alerts from telemetry_alerts as security findings
      const { data: alerts, error: alertErr } = await supabase
        .from("telemetry_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (alertErr) throw alertErr;

      if (!alerts || alerts.length === 0) return [];

      return alerts.map((alert, idx) => ({
        id: alert.id || `SEC-${String(idx + 1).padStart(3, "0")}`,
        title: alert.alert_type || "Security Finding",
        severity: mapSeverity(alert.severity),
        category: alert.alert_type?.includes("engine") ? "Equipment" : 
                  alert.alert_type?.includes("position") ? "Navigation" :
                  alert.alert_type?.includes("fuel") ? "Operations" : "System",
        description: alert.message || "Finding detected by automated scan",
        status: alert.acknowledged ? "fixed" as const : "open" as const,
      }));
    },
  });

  const markFixed = useFixSecurityFinding();

  return { findings, isLoading, error, refetch, markFixed };
}

function mapSeverity(severity: string | null): SecurityFinding["severity"] {
  switch (severity?.toLowerCase()) {
    case "critical": return "critical";
    case "high": return "high";
    case "medium": return "medium";
    case "low": return "low";
    default: return "info";
  }
}
