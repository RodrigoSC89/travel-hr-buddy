/**
 * Hook para trilha de auditoria real
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

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

function mapSeverity(severity: string | null): "info" | "warning" | "critical" {
  switch (severity?.toLowerCase()) {
    case "critical":
    case "error":
    case "high":
      return "critical";
    case "warning":
    case "medium":
      return "warning";
    default:
      return "info";
  }
}

export function useAuditTrailRealData() {
  const queryClient = useQueryClient();
  const [realtimeEntries, setRealtimeEntries] = useState<AuditEntry[]>([]);

  // Fetch audit entries from access_logs
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["audit-trail-entries"],
    queryFn: async (): Promise<AuditEntry[]> => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (error) throw error;

      return (data || []).map(log => {
        const details = log.details as Record<string, unknown> | null;
        return {
          id: log.id,
          timestamp: new Date(log.timestamp),
          userId: log.user_id || "system",
          userName: (details?.user_name as string) || "Sistema",
          action: log.action || "VIEW",
          module: log.module_accessed || "Sistema",
          details: (details?.description as string) || `${log.action} em ${log.module_accessed}`,
          severity: mapSeverity(log.severity),
          ipAddress: String(log.ip_address || "0.0.0.0"),
          metadata: details as Record<string, unknown> | undefined,
        };
      });
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Fetch AI insights
  const { data: insights = [] } = useQuery({
    queryKey: ["audit-ai-insights"],
    queryFn: async (): Promise<AIInsight[]> => {
      const { data, error } = await supabase
        .from("ai_access_anomalies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map(anomaly => ({
        id: anomaly.id,
        type: (anomaly.anomaly_type as AIInsight["type"]) || "anomaly",
        title: anomaly.description || "Anomalia detectada",
        description: anomaly.recommendation || "Análise de padrão de acesso",
        confidence: Math.round((anomaly.confidence || 0.8) * 100),
        affectedEntries: (anomaly.evidence as Record<string, unknown> | null)?.affected_count as number || 1,
        timestamp: new Date(anomaly.created_at),
      }));
    },
    staleTime: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("audit-trail-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "access_logs" },
        (payload) => {
          const realtimeDetails = payload.new.details as Record<string, unknown> | null;
          const newEntry: AuditEntry = {
            id: payload.new.id,
            timestamp: new Date(payload.new.timestamp),
            userId: payload.new.user_id || "system",
            userName: (realtimeDetails?.user_name as string) || "Sistema",
            action: payload.new.action || "VIEW",
            module: payload.new.module_accessed || "Sistema",
            details: `${payload.new.action} - ${payload.new.result}`,
            severity: mapSeverity(payload.new.severity),
            ipAddress: String(payload.new.ip_address || "0.0.0.0"),
          };
          setRealtimeEntries(prev => [newEntry, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Combine realtime with fetched
  const combinedEntries = [...realtimeEntries, ...entries]
    .filter((entry, index, self) =>
      index === self.findIndex(e => e.id === entry.id)
    )
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Add new insight mutation
  const addInsight = useMutation({
    mutationFn: async (insight: Omit<AIInsight, "id" | "timestamp">) => {
      const { error } = await supabase.from("ai_access_anomalies").insert({
        anomaly_type: insight.type,
        description: insight.title,
        recommendation: insight.description,
        confidence: insight.confidence / 100,
        severity: insight.type === "risk" ? "high" : "medium",
        evidence: { affected_count: insight.affectedEntries },
        event_id: `ai-${Date.now()}`,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-ai-insights"] });
    },
  });

  // Stats
  const stats = {
    total: combinedEntries.length,
    critical: combinedEntries.filter(e => e.severity === "critical").length,
    insightsCount: insights.length,
    recommendations: insights.filter(i => i.type === "recommendation").length,
  };

  return {
    entries: combinedEntries,
    insights,
    stats,
    isLoading,
    addInsight: addInsight.mutate,
  };
}
