/**
 * Hook para dados reais de gestão de tarefas
 * Substitui mockTasks em task-management.tsx
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_at: string;
  updated_at?: string;
  vessel_id?: string;
  vessel_name?: string;
  category?: string;
  progress?: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

export function useTaskManagementData(vesselId?: string) {
  const queryClient = useQueryClient();

  // Fetch tasks from action_items table
  const tasksQuery = useQuery({
    queryKey: ["task-management", vesselId],
    queryFn: async (): Promise<Task[]> => {
      let query = supabase
        .from("action_items")
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          assigned_to,
          assigned_to_name,
          created_at,
          updated_at,
          vessel_id
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (vesselId) {
        query = query.eq("vessel_id", vesselId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        status: mapStatus(item.status),
        priority: mapPriority(item.priority),
        due_date: item.due_date || undefined,
        assigned_to: item.assigned_to || undefined,
        assigned_to_name: item.assigned_to_name || undefined,
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || undefined,
        vessel_id: item.vessel_id || undefined,
        vessel_name: undefined,
        progress: calculateProgress(item.status),
      }));
    },
    staleTime: 60000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Stats calculation
  const statsQuery = useQuery({
    queryKey: ["task-stats", vesselId, tasksQuery.data],
    queryFn: async (): Promise<TaskStats> => {
      const tasks = tasksQuery.data || [];
      const now = new Date();

      return {
        total: tasks.length,
        pending: tasks.filter(t => t.status === "pending").length,
        inProgress: tasks.filter(t => t.status === "in_progress").length,
        completed: tasks.filter(t => t.status === "completed").length,
        overdue: tasks.filter(t => 
          t.due_date && 
          new Date(t.due_date) < now && 
          t.status !== "completed"
        ).length,
      };
    },
    enabled: !!tasksQuery.data,
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const { data: user } = await supabase.auth.getUser();

      const { data: task, error } = await supabase
        .from("action_items")
        .insert({
          title: data.title || "Nova Tarefa",
          description: data.description,
          status: data.status || "pending",
          priority: data.priority || "medium",
          due_date: data.due_date,
          assigned_to_name: data.assigned_to_name,
          vessel_id: data.vessel_id,
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-management"] });
    },
  });

  // Update task mutation
  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      const { data, error } = await supabase
        .from("action_items")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-management"] });
    },
  });

  // Delete task mutation
  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("action_items")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-management"] });
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("task-management-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "action_items" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["task-management"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    tasks: tasksQuery.data || [],
    stats: statsQuery.data,
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask,
    updateTask,
    deleteTask,
    refetch: tasksQuery.refetch,
  };
}

function mapStatus(status?: string | null): Task["status"] {
  if (!status) return "pending";
  if (status === "completed" || status === "done") return "completed";
  if (status === "in_progress" || status === "ongoing") return "in_progress";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function mapPriority(priority?: string | null): Task["priority"] {
  if (!priority) return "medium";
  if (priority === "urgent" || priority === "critical") return "urgent";
  if (priority === "high") return "high";
  if (priority === "low") return "low";
  return "medium";
}

function calculateProgress(status?: string | null): number {
  if (!status) return 0;
  if (status === "completed" || status === "done") return 100;
  if (status === "in_progress" || status === "ongoing") return 50;
  return 0;
}
