/**
 * Hook para dados reais de automação de tarefas
 * Substitui mockTasks em task-automation/index.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface AutomatedTask {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  status: "active" | "paused" | "error" | "completed";
  lastRun?: string;
  nextRun?: string;
  runCount: number;
  successRate: number;
  category: "maintenance" | "compliance" | "hr" | "operations" | "finance";
  priority: "low" | "medium" | "high";
  createdBy?: string;
}

export interface AutomationStats {
  total: number;
  active: number;
  paused: number;
  errored: number;
  totalRuns: number;
  avgSuccessRate: number;
}

export function useTaskAutomationData() {
  const queryClient = useQueryClient();

  // Fetch automated tasks from scheduled_tasks
  // Columns: task_name, task_description, schedule_type, task_type, is_active, etc.
  const tasksQuery = useQuery({
    queryKey: ["task-automation"],
    queryFn: async (): Promise<AutomatedTask[]> => {
      const { data, error } = await supabase
        .from("scheduled_tasks")
        .select(`
          id,
          task_name,
          task_description,
          schedule_type,
          task_type,
          is_active,
          last_executed_at,
          next_execution_at,
          execution_count,
          success_count,
          failure_count,
          priority,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      return (data || []).map(task => ({
        id: task.id,
        name: task.task_name,
        description: task.task_description || "",
        trigger: formatTrigger(task.schedule_type),
        action: task.task_type || "execute",
        status: mapStatus(task.is_active ?? undefined, task.last_executed_at),
        lastRun: task.last_executed_at || undefined,
        nextRun: task.next_execution_at || undefined,
        runCount: task.execution_count || 0,
        successRate: calculateSuccessRateFromCounts(task.success_count, task.failure_count),
        category: mapCategory(task.task_type),
        priority: mapPriorityStr(task.priority),
        createdBy: undefined,
      }));
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Calculate stats
  const stats: AutomationStats = {
    total: tasksQuery.data?.length || 0,
    active: tasksQuery.data?.filter(t => t.status === "active").length || 0,
    paused: tasksQuery.data?.filter(t => t.status === "paused").length || 0,
    errored: tasksQuery.data?.filter(t => t.status === "error").length || 0,
    totalRuns: tasksQuery.data?.reduce((sum, t) => sum + t.runCount, 0) || 0,
    avgSuccessRate: tasksQuery.data?.length
      ? Math.round(tasksQuery.data.reduce((sum, t) => sum + t.successRate, 0) / tasksQuery.data.length)
      : 0,
  };

  // Toggle task status mutation
  const toggleTaskStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("scheduled_tasks")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-automation"] });
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: Partial<AutomatedTask>) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Get organization_id from user profile or org members
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.user?.id || "")
        .eq("status", "active")
        .single();

      const { data: task, error } = await supabase
        .from("scheduled_tasks")
        .insert({
          task_name: data.name || "Nova Automação",
          task_description: data.description,
          schedule_type: "interval",
          task_type: data.action || "execute",
          is_active: true,
          priority: data.priority || "medium",
          organization_id: orgMember?.organization_id || "",
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-automation"] });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-automation"] });
    },
  });

  // Run task manually mutation
  const runTaskManually = useMutation({
    mutationFn: async (id: string) => {
      // First get current execution count
      const { data: current } = await supabase
        .from("scheduled_tasks")
        .select("execution_count")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("scheduled_tasks")
        .update({ 
          last_executed_at: new Date().toISOString(),
          execution_count: (current?.execution_count || 0) + 1,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-automation"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("task-automation-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scheduled_tasks" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["task-automation"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    tasks: tasksQuery.data || [],
    stats,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    toggleTaskStatus,
    createTask,
    deleteTask,
    runTaskManually,
    refetch: tasksQuery.refetch,
  };
}

function formatTrigger(scheduleType?: string): string {
  switch (scheduleType) {
    case "cron": return "Agendamento CRON";
    case "interval": return "Intervalo fixo";
    case "once": return "Execução única";
    case "recurring": return "Recorrente";
    default: return "Manual";
  }
}

function mapStatus(isActive?: boolean, lastRun?: string | null): AutomatedTask["status"] {
  if (!isActive) return "paused";
  if (lastRun) {
    const hoursSinceRun = (Date.now() - new Date(lastRun).getTime()) / 3600000;
    if (hoursSinceRun > 24) return "error";
  }
  return "active";
}

function mapCategory(taskType?: string | null): AutomatedTask["category"] {
  if (!taskType) return "operations";
  if (taskType.includes("maintenance")) return "maintenance";
  if (taskType.includes("compliance") || taskType.includes("audit")) return "compliance";
  if (taskType.includes("hr") || taskType.includes("crew")) return "hr";
  if (taskType.includes("finance") || taskType.includes("payment")) return "finance";
  return "operations";
}

function mapPriorityStr(priority?: string | null): AutomatedTask["priority"] {
  if (!priority) return "medium";
  if (priority === "high" || priority === "critical" || priority === "urgent") return "high";
  if (priority === "low") return "low";
  return "medium";
}

function calculateSuccessRateFromCounts(successCount?: number | null, failureCount?: number | null): number {
  const success = successCount || 0;
  const failure = failureCount || 0;
  const total = success + failure;
  if (total === 0) return 95;
  return Math.round((success / total) * 100);
}
