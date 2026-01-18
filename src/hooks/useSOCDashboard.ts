import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface SOCAlert {
  id: string;
  organization_id: string;
  vessel_id?: string;
  alert_type: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  title: string;
  message: string;
  source_module?: string;
  source_reference_id?: string;
  metadata?: Record<string, unknown>;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

interface DashboardStats {
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    unacknowledged: number;
    by_type: Record<string, number>;
  };
  crew: {
    total: number;
    onboard: number;
    onshore: number;
    on_leave: number;
  };
  vessels: {
    total: number;
    active: number;
    in_port: number;
    maintenance: number;
  };
  invoices: {
    pending_count: number;
    pending_amount: number;
    overdue_count: number;
  };
  siscomex: {
    total_7_days: number;
    pending: number;
    sent: number;
    acknowledged: number;
    errors: number;
  };
  last_updated: string;
}

interface ComplianceDeadline {
  id: string;
  type: string;
  description: string;
  expiry_date: string;
  days_until_expiry: number;
  severity: string;
}

export function useSOCDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<SOCAlert[]>([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState<ComplianceDeadline[]>([]);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  const callSOCAPI = useCallback(async (operation: string, payload?: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Não autenticado");

    const response = await supabase.functions.invoke("soc-dashboard", {
      body: { operation, payload },
    });

    if (response.error) throw new Error(response.error.message);
    if (!response.data.success) throw new Error(response.data.error);

    return response.data;
  }, []);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await callSOCAPI("get_dashboard_stats");
      setStats(result.stats);
      return result.stats;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar estatísticas";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSOCAPI]);

  const fetchActiveAlerts = useCallback(async (filters?: { severity?: string; alert_type?: string; limit?: number }) => {
    setIsLoading(true);
    try {
      const result = await callSOCAPI("get_active_alerts", filters);
      setAlerts(result.alerts || []);
      return result.alerts;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar alertas";
      toast.error("Erro", { description: message });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [callSOCAPI]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      await callSOCAPI("acknowledge_alert", { alert_id: alertId });
      toast.success("Alerta reconhecido");
      // Update local state
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, is_acknowledged: true, acknowledged_at: new Date().toISOString() } : a
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao reconhecer alerta";
      toast.error("Erro", { description: message });
      throw error;
    }
  }, [callSOCAPI]);

  const resolveAlert = useCallback(async (alertId: string, resolutionNotes?: string) => {
    try {
      await callSOCAPI("resolve_alert", { alert_id: alertId, resolution_notes: resolutionNotes });
      toast.success("Alerta resolvido");
      // Remove from active alerts
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao resolver alerta";
      toast.error("Erro", { description: message });
      throw error;
    }
  }, [callSOCAPI]);

  const createAlert = useCallback(async (alertData: {
    alert_type: string;
    severity: string;
    title: string;
    message: string;
    vessel_id?: string;
    source_module?: string;
    source_reference_id?: string;
    metadata?: Record<string, unknown>;
  }) => {
    try {
      const result = await callSOCAPI("create_alert", alertData);
      toast.success("Alerta criado");
      return result.alert_id;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar alerta";
      toast.error("Erro", { description: message });
      throw error;
    }
  }, [callSOCAPI]);

  const fetchComplianceDeadlines = useCallback(async () => {
    try {
      const result = await callSOCAPI("get_compliance_deadlines");
      setComplianceDeadlines(result.deadlines || []);
      return result.deadlines;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao buscar deadlines";
      toast.error("Erro", { description: message });
      throw error;
    }
  }, [callSOCAPI]);

  // Setup realtime subscription for new alerts
  const subscribeToAlerts = useCallback(() => {
    const channel = supabase
      .channel("soc-alerts-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "soc_alerts",
        },
        (payload) => {
          const newAlert = payload.new as SOCAlert;
          setAlerts((prev) => [newAlert, ...prev]);
          
          // Show toast for critical/high alerts
          if (["critical", "high"].includes(newAlert.severity)) {
            toast.warning(`Novo Alerta: ${newAlert.title}`, {
              description: newAlert.message,
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    setRealtimeChannel(channel);
    return channel;
  }, []);

  const unsubscribeFromAlerts = useCallback(() => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      setRealtimeChannel(null);
    }
  }, [realtimeChannel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  return {
    isLoading,
    stats,
    alerts,
    complianceDeadlines,
    fetchDashboardStats,
    fetchActiveAlerts,
    acknowledgeAlert,
    resolveAlert,
    createAlert,
    fetchComplianceDeadlines,
    subscribeToAlerts,
    unsubscribeFromAlerts,
  };
}
