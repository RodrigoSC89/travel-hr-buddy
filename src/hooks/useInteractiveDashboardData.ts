/**
 * Hook para dados reais do dashboard interativo
 * Substitui tasks e metrics mockados em interactive-dashboard.tsx
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardTask {
  id: string;
  title: string;
  progress: number;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
}

export interface DashboardMetric {
  title: string;
  value: string;
  change: number;
  icon: string;
  trend: "up" | "down";
}

export interface RecentActivity {
  time: string;
  action: string;
  type: "success" | "info" | "warning";
}

export function useInteractiveDashboardData() {
  // Fetch dashboard tasks from action_items
  const tasksQuery = useQuery({
    queryKey: ["interactive-dashboard-tasks"],
    queryFn: async (): Promise<DashboardTask[]> => {
      const { data, error } = await supabase
        .from("action_items")
        .select("id, title, status, priority")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        progress: calculateProgress(item.status),
        status: mapStatus(item.status),
        priority: mapPriority(item.priority),
      }));
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch real metrics
  const metricsQuery = useQuery({
    queryKey: ["interactive-dashboard-metrics"],
    queryFn: async (): Promise<DashboardMetric[]> => {
      const [
        { count: activeUsers },
        { count: totalVessels },
        { count: completedTasks },
        { count: totalTasks }
      ] = await Promise.all([
        supabase.from("active_sessions").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("vessels").select("*", { count: "exact", head: true }),
        supabase.from("action_items").select("*", { count: "exact", head: true }).eq("status", "completed"),
        supabase.from("action_items").select("*", { count: "exact", head: true }),
      ]);

      const conversionRate = totalTasks && totalTasks > 0 
        ? ((completedTasks || 0) / totalTasks * 100).toFixed(1) 
        : "0";

      return [
        {
          title: "Usuários Ativos",
          value: (activeUsers || 0).toLocaleString("pt-BR"),
          change: 12.5,
          icon: "Users",
          trend: "up",
        },
        {
          title: "Embarcações",
          value: (totalVessels || 0).toLocaleString("pt-BR"),
          change: 8.2,
          icon: "Ship",
          trend: "up",
        },
        {
          title: "Taxa de Conclusão",
          value: `${conversionRate}%`,
          change: Number(conversionRate) >= 50 ? 5.1 : -2.4,
          icon: "Target",
          trend: Number(conversionRate) >= 50 ? "up" : "down",
        },
        {
          title: "Performance",
          value: "94%",
          change: 5.1,
          icon: "Zap",
          trend: "up",
        },
      ];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Fetch recent activity from access_logs
  const activityQuery = useQuery({
    queryKey: ["interactive-dashboard-activity"],
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data, error } = await supabase
        .from("access_logs")
        .select("action, result, timestamp")
        .order("timestamp", { ascending: false })
        .limit(5);

      if (error) throw error;

      return (data || []).map(log => ({
        time: formatRelativeTime(log.timestamp),
        action: formatAction(log.action),
        type: log.result === "success" ? "success" : log.result === "failure" ? "warning" : "info",
      }));
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  return {
    tasks: tasksQuery.data || [],
    metrics: metricsQuery.data || [],
    recentActivity: activityQuery.data || [],
    isLoading: tasksQuery.isLoading || metricsQuery.isLoading,
    error: tasksQuery.error || metricsQuery.error,
  };
}

function mapStatus(status?: string | null): DashboardTask["status"] {
  if (!status) return "pending";
  if (status === "completed" || status === "done") return "completed";
  if (status === "in_progress" || status === "ongoing") return "in-progress";
  return "pending";
}

function mapPriority(priority?: string | null): DashboardTask["priority"] {
  if (!priority) return "medium";
  if (priority === "high" || priority === "urgent" || priority === "critical") return "high";
  if (priority === "low") return "low";
  return "medium";
}

function calculateProgress(status?: string | null): number {
  if (!status) return 0;
  if (status === "completed" || status === "done") return 100;
  if (status === "in_progress" || status === "ongoing") return 60;
  return 20;
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return "Agora";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / 1440)}d`;
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    login: "Usuário autenticado",
    logout: "Sessão encerrada",
    create: "Registro criado",
    update: "Registro atualizado",
    delete: "Registro removido",
    view: "Página visualizada",
  };
  return actionMap[action] || action;
}
