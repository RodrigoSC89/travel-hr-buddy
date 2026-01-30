/**
 * Hook para alertas reais do DP Intelligence
 * Substitui dados mockados por alertas do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface DPAlert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

export interface DPAlertConfig {
  name: string;
  enabled: boolean;
  sound: boolean;
}

function mapSeverity(severity: string | null): "critical" | "warning" | "info" {
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

export function useDPAlertsRealData() {
  const queryClient = useQueryClient();
  const [realtimeAlerts, setRealtimeAlerts] = useState<DPAlert[]>([]);

  // Fetch alerts from soc_alerts table
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["dp-alerts"],
    queryFn: async (): Promise<DPAlert[]> => {
      const { data, error } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;

      return (data || []).map(alert => ({
        id: alert.id,
        title: alert.title || "Alerta do Sistema",
        description: alert.message || "",
        severity: mapSeverity(alert.severity),
        timestamp: alert.created_at || new Date().toISOString(),
        acknowledged: alert.acknowledged_at !== null,
        source: alert.source_module || "DP System",
      }));
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("dp-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "soc_alerts" },
        (payload) => {
          const newAlert: DPAlert = {
            id: payload.new.id,
            title: payload.new.title || "Novo Alerta",
            description: payload.new.message || "",
            severity: mapSeverity(payload.new.severity),
            timestamp: payload.new.created_at || new Date().toISOString(),
            acknowledged: false,
            source: payload.new.source_module || "DP System",
          };
          setRealtimeAlerts(prev => [newAlert, ...prev].slice(0, 20));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "soc_alerts" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dp-alerts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Acknowledge alert mutation
  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("soc_alerts")
        .update({ 
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq("id", alertId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dp-alerts"] });
    },
  });

  // Combine realtime with fetched
  const combinedAlerts = [...realtimeAlerts, ...alerts]
    .filter((alert, index, self) => 
      index === self.findIndex(a => a.id === alert.id)
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Stats
  const stats = {
    unacknowledged: combinedAlerts.filter(a => !a.acknowledged).length,
    critical: combinedAlerts.filter(a => a.severity === "critical" && !a.acknowledged).length,
    acknowledged: combinedAlerts.filter(a => a.acknowledged).length,
    lastAlertTime: combinedAlerts[0]?.timestamp 
      ? new Date(combinedAlerts[0].timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      : "--:--",
  };

  // Default config (can be fetched from user preferences table later)
  const alertConfig: DPAlertConfig[] = [
    { name: "Falha de Thruster", enabled: true, sound: true },
    { name: "Perda de Referência", enabled: true, sound: true },
    { name: "Drift Excessivo", enabled: true, sound: true },
    { name: "Condições Ambientais", enabled: true, sound: false },
    { name: "Manutenção", enabled: true, sound: false },
    { name: "Power Management", enabled: true, sound: true },
  ];

  return {
    alerts: combinedAlerts,
    stats,
    alertConfig,
    isLoading,
    acknowledgeAlert: (id: string) => acknowledgeAlert.mutate(id),
  };
}
