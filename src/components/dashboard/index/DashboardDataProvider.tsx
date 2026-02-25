/**
 * Dashboard Data Provider - Uses get_dashboard_kpis RPC for single-call metrics
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/lib/logger';

export interface DashboardMetrics {
  totalVessels: number;
  activeVessels: number;
  totalCrew: number;
  activeCrew: number;
  pendingMaintenance: number;
  criticalAlerts: number;
  completedTasks: number;
  complianceRate: number;
  revenueThisMonth: number;
  revenueGrowth: number;
  certsExpiring30: number;
  certsExpiring90: number;
  certsExpired: number;
  safetyScore: number;
  voyagesActive: number;
  lastUpdated: Date;
  isLoading: boolean;
}

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  createdAt: Date;
  isRead: boolean;
}

const defaultMetrics: DashboardMetrics = {
  totalVessels: 0,
  activeVessels: 0,
  totalCrew: 0,
  activeCrew: 0,
  pendingMaintenance: 0,
  criticalAlerts: 0,
  completedTasks: 0,
  complianceRate: 0,
  revenueThisMonth: 0,
  revenueGrowth: 0,
  certsExpiring30: 0,
  certsExpiring90: 0,
  certsExpired: 0,
  safetyScore: 100,
  voyagesActive: 0,
  lastUpdated: new Date(),
  isLoading: true
};

export function useDashboardData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
    try {
      // Single RPC call replaces 7+ sequential queries
      const { data: kpis, error: kpiError } = await supabase.rpc('get_dashboard_kpis');

      // Fetch notifications separately (lightweight)
      const { data: aiInsights } = await supabase
        .from("ai_insights")
        .select("id, title, description, priority, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (kpiError) {
        logger.error("RPC get_dashboard_kpis error:", kpiError);
        throw kpiError;
      }

      const k = kpis as Record<string, number>;

      const mappedNotifications: RealtimeNotification[] = (aiInsights || []).map((insight) => ({
        id: insight.id,
        title: insight.title || "Insight",
        message: insight.description || "",
        type: insight.priority === "high" ? "warning" as const : "info" as const,
        createdAt: new Date(insight.created_at),
        isRead: insight.status === "read"
      }));

      setMetrics({
        totalVessels: k.vessels_total || 0,
        activeVessels: k.vessels_active || 0,
        totalCrew: k.crew_total || 0,
        activeCrew: k.crew_onboard || 0,
        pendingMaintenance: k.maint_pending || 0,
        criticalAlerts: k.incidents_open || 0,
        completedTasks: 0,
        complianceRate: k.compliance_score || 0,
        revenueThisMonth: k.expenses_30d || 0,
        revenueGrowth: 0,
        certsExpiring30: k.certs_expiring_30 || 0,
        certsExpiring90: k.certs_expiring_90 || 0,
        certsExpired: k.certs_expired || 0,
        safetyScore: k.safety_score || 100,
        voyagesActive: k.voyages_active || 0,
        lastUpdated: new Date(),
        isLoading: false
      });

      setNotifications(mappedNotifications);

    } catch (error) {
      logger.error("Error fetching dashboard metrics:", error);
      setMetrics(prev => ({
        ...prev,
        isLoading: false,
        lastUpdated: new Date()
      }));
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchMetrics();
    setIsRefreshing(false);
    toast({
      title: "Dados atualizados",
      description: "O dashboard foi atualizado com os dados mais recentes"
    });
  }, [fetchMetrics, toast]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    await supabase
      .from("ai_insights")
      .update({ status: "read" })
      .eq("id", id);
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    if (unreadIds.length > 0) {
      await supabase
        .from("ai_insights")
        .update({ status: "read" })
        .in("id", unreadIds);
    }

    toast({
      title: "Notificações marcadas como lidas",
      description: `${unreadIds.length} notificações foram marcadas como lidas`
    });
  }, [notifications, toast]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  // Realtime subscriptions for critical tables
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vessels' }, () => fetchMetrics())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'crew_members' }, () => fetchMetrics())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'soc_alerts' }, (payload) => {
        const alert = payload.new as Record<string, unknown>;
        toast({
          title: `⚠️ ${alert.title || 'Novo Alerta'}`,
          description: String(alert.message || 'Um novo alerta foi registrado'),
        });
        fetchMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMetrics, toast]);

  return {
    metrics,
    notifications,
    isRefreshing,
    refresh,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length
  };
}
