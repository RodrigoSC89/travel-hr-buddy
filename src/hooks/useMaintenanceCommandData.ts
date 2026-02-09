/**
 * useMaintenanceCommandData - Hook para integração do Maintenance Command com Supabase
 * PATCH: Eliminação de dados mockados - Integração real
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string | null;
  vessel_id?: string | null;
  vessel_name?: string | null;
  equipment_id?: string | null;
  equipment_name?: string | null;
  type: string;
  priority: string;
  status: string;
  scheduled_date?: string | null;
  completed_date?: string | null;
  estimated_hours?: number | null;
  actual_hours?: number | null;
  assigned_to?: string | null;
  cost_estimate?: number | null;
  actual_cost?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel_id?: string | null;
  vessel_name?: string | null;
  status: "operational" | "maintenance" | "offline" | "critical";
  last_maintenance?: string | null;
  next_maintenance?: string | null;
  running_hours?: number | null;
  health_score?: number | null;
  failure_probability?: number | null;
}

export interface MaintenanceSummary {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTask: number;
  avgCompletionTime: number;
  totalCost: number;
  predictedFailures: number;
}

export function useMaintenanceCommandData(vesselId?: string) {
  const queryClient = useQueryClient();

  // Fetch maintenance tasks
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery({
    queryKey: ["maintenance-tasks", vesselId],
    queryFn: async (): Promise<MaintenanceTask[]> => {
      try {
        let query = supabase
          .from("maintenance_tasks")
          .select(`
            *,
            vessels(name)
          `)
          .order("scheduled_date", { ascending: true });

        if (vesselId) {
          query = query.eq("vessel_id", vesselId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((t) => ({
          id: t.id,
          title: t.title || t.description?.substring(0, 50) || "Tarefa de Manutenção",
          description: t.description,
          vessel_id: t.vessel_id,
          vessel_name: t.vessels?.name,
          equipment_id: t.component_id,
          equipment_name: t.component_name,
          type: t.task_type || "corrective",
          priority: t.priority || "medium",
          status: t.status || "pending",
          scheduled_date: t.scheduled_date,
          completed_date: t.completed_date,
          estimated_hours: t.estimated_hours,
          actual_hours: t.actual_hours,
          assigned_to: t.assigned_to,
          cost_estimate: t.estimated_hours ? t.estimated_hours * 100 : null,
          actual_cost: t.actual_hours ? t.actual_hours * 100 : null,
          created_at: t.created_at,
          updated_at: t.updated_at,
        }));
      } catch (error) {
        logger.error("Failed to fetch maintenance tasks", error);
        return [];
      }
    },
  });

  // Fetch equipment list from ai_maintenance_predictions as fallback
  const {
    data: equipment = [],
    isLoading: isLoadingEquipment,
  } = useQuery({
    queryKey: ["maintenance-equipment", vesselId],
    queryFn: async (): Promise<Equipment[]> => {
      try {
        // Use AI predictions as equipment source
        const { data: predictions, error } = await supabase
          .from("ai_maintenance_predictions")
          .select("*")
          .limit(20);

        if (error) throw error;

        return (predictions || []).map((p) => ({
          id: p.id,
          name: p.equipment_name,
          type: "monitored",
          vessel_id: p.vessel_id,
          status: p.failure_probability > 0.7 ? "critical" : 
                  p.failure_probability > 0.4 ? "maintenance" : "operational",
          health_score: (1 - (p.failure_probability || 0)) * 100,
          failure_probability: p.failure_probability,
        }));
      } catch (error) {
        logger.error("Failed to fetch equipment", error);
        return [];
      }
    },
  });

  // Fetch predictive maintenance insights
  const {
    data: predictions = [],
    isLoading: isLoadingPredictions,
  } = useQuery({
    queryKey: ["maintenance-predictions", vesselId],
    queryFn: async () => {
      try {
        let query = supabase
          .from("ai_maintenance_predictions")
          .select(`
            *,
            vessels(name)
          `)
          .order("failure_probability", { ascending: false })
          .limit(10);

        if (vesselId) {
          query = query.eq("vessel_id", vesselId);
        }

        const { data, error } = await query;
        if (error) throw error;

        return (data || []).map((p) => ({
          id: p.id,
          equipmentId: p.equipment_id,
          equipmentName: p.equipment_name,
          vesselName: p.vessels?.name,
          failureProbability: p.failure_probability,
          predictedDate: p.predicted_failure_date,
          recommendedAction: p.recommended_action,
          confidence: p.confidence,
          riskFactors: p.risk_factors,
          status: p.status,
        }));
      } catch (error) {
        logger.error("Failed to fetch predictions", error);
        return [];
      }
    },
  });

  // Summary statistics
  const {
    data: summary,
    isLoading: isLoadingSummary,
  } = useQuery({
    queryKey: ["maintenance-summary", vesselId],
    queryFn: async (): Promise<MaintenanceSummary> => {
      const pending = tasks.filter(t => t.status === "pending").length;
      const inProgress = tasks.filter(t => t.status === "in_progress").length;
      const completed = tasks.filter(t => t.status === "completed").length;
      const overdue = tasks.filter(t => 
        t.status !== "completed" && 
        t.scheduled_date && 
        new Date(t.scheduled_date) < new Date()
      ).length;

      const completedTasks = tasks.filter(t => t.status === "completed" && t.actual_hours);
      const avgTime = completedTasks.length > 0
        ? completedTasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0) / completedTasks.length
        : 0;

      const totalCost = tasks.reduce((sum, t) => sum + (t.actual_cost || t.cost_estimate || 0), 0);
      const criticalPredictions = predictions.filter((p) => (p.failureProbability ?? 0) > 0.6).length;

      return {
        totalTasks: tasks.length,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        completedTasks: completed,
        overdueTask: overdue,
        avgCompletionTime: avgTime,
        totalCost,
        predictedFailures: criticalPredictions,
      };
    },
    enabled: tasks.length > 0 || predictions.length > 0,
  });

  // Create maintenance task
  const createTask = useMutation({
    mutationFn: async (data: Partial<MaintenanceTask>) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const insertData: Record<string, unknown> = {
        title: data.title,
        description: data.description,
        vessel_id: data.vessel_id,
        component_id: data.equipment_id,
        component_name: data.equipment_name,
        task_type: data.type,
        priority: data.priority,
        status: "pending",
        scheduled_date: data.scheduled_date,
        estimated_hours: data.estimated_hours,
        created_by: userData?.user?.id,
      };

      const { data: result, error } = await supabase
        .from("maintenance_tasks")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Tarefa criada com sucesso");
    },
    onError: (error) => {
      logger.error("Failed to create task", error);
      toast.error("Erro ao criar tarefa");
    },
  });

  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, string> = { status };
      if (status === "completed") {
        updates.completed_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("maintenance_tasks")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["maintenance-summary"] });
      toast.success("Status atualizado");
    },
    onError: (error) => {
      logger.error("Failed to update task status", error);
      toast.error("Erro ao atualizar status");
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
    queryClient.invalidateQueries({ queryKey: ["maintenance-equipment"] });
    queryClient.invalidateQueries({ queryKey: ["maintenance-predictions"] });
    queryClient.invalidateQueries({ queryKey: ["maintenance-summary"] });
  };

  return {
    tasks,
    equipment,
    predictions,
    summary: summary || {
      totalTasks: 0,
      pendingTasks: 0,
      inProgressTasks: 0,
      completedTasks: 0,
      overdueTask: 0,
      avgCompletionTime: 0,
      totalCost: 0,
      predictedFailures: 0,
    },
    isLoading: isLoadingTasks || isLoadingEquipment,
    isLoadingTasks,
    isLoadingEquipment,
    isLoadingPredictions,
    isLoadingSummary,
    tasksError,
    createTask,
    updateTaskStatus,
    refresh,
  };
}
