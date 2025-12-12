/**
 * Dashboard Data Provider - Fetches real data from Supabase
 * Provides live metrics and stats for the dashboard
 */

import { memo, memo, useCallback, useEffect, useState } from "react";;;
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  lastUpdated: new Date(),
  isLoading: true
};

export const useDashboardData = memo(function() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = useCallback(async () => {
    try {
      // Fetch vessels
      const { data: vessels, count: vesselCount } = await supabase
        .from("vessels")
        .select("*", { count: "exact" });
      
      const activeVessels = vessels?.filter((v: unknown) => v.status === "active" || v.status === "operational")?.length || 0;

      // Fetch crew members
      const { count: crewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true });
      
      const { count: activeCrewCount } = await supabase
        .from("crew_members")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Fetch operational checklists as pending items
      const { count: pendingMaintenanceCount } = await supabase
        .from("operational_checklists")
        .select("*", { count: "exact", head: true })
        .neq("status", "completed");

      // Fetch critical alerts
      const { count: criticalAlertsCount } = await supabase
        .from("price_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Fetch AI insights for notifications
      const { data: aiInsights } = await supabase
        .from("ai_insights")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      // Calculate compliance from audit data
      const { data: audits } = await supabase
        .from("audit_center_logs")
        .select("compliance_score")
        .not("compliance_score", "is", null)
        .limit(50);
      
      const avgCompliance = audits?.length 
        ? audits.reduce((sum, a) => sum + (a.compliance_score || 0), 0) / audits.length 
        : 95;

      // Map AI insights to notifications
      const mappedNotifications: RealtimeNotification[] = (aiInsights || []).map((insight: unknown) => ({
        id: insight.id,
        title: insight.title || "Insight",
        message: insight.description || "",
        type: insight.priority === "high" ? "warning" : "info",
        createdAt: new Date(insight.created_at),
        isRead: insight.status === "read"
      }));

      setMetrics({
        totalVessels: vesselCount || 0,
        activeVessels: activeVessels,
        totalCrew: crewCount || 0,
        activeCrew: activeCrewCount || 0,
        pendingMaintenance: pendingMaintenanceCount || 0,
        criticalAlerts: criticalAlertsCount || 0,
        completedTasks: 0,
        complianceRate: Math.round(avgCompliance * 10) / 10,
        revenueThisMonth: 0,
        revenueGrowth: 0,
        lastUpdated: new Date(),
        isLoading: false
      });

      setNotifications(mappedNotifications);

    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      // Set default values on error
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

    // Update in database
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
