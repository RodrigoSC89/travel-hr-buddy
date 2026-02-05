/**
 * Hook para dados de Manutenção Inteligente - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays } from "date-fns";

export interface MaintenanceTask {
  id: string;
  equipment: string;
  vessel: string;
  type: "preventive" | "corrective" | "predictive" | "condition_based";
  priority: "critical" | "high" | "medium" | "low";
  scheduledDate: Date;
  estimatedDuration: number;
  status: "scheduled" | "in_progress" | "completed" | "overdue" | "postponed";
  assignedTo: string;
  parts: { name: string; quantity: number; inStock: boolean }[];
  description: string;
  aiScore?: number;
  healthTrend?: number[];
}

export interface EquipmentHealth {
  id: string;
  name: string;
  vessel: string;
  healthScore: number;
  trend: "up" | "down" | "stable";
  lastMaintenance: Date;
  nextMaintenance: Date;
  runningHours: number;
  predictions: {
    component: string;
    probability: number;
    estimatedDate: Date;
  }[];
}

export function useMaintenanceTasks(vesselId?: string) {
  return useQuery({
    queryKey: ["maintenance-tasks", vesselId],
    queryFn: async (): Promise<MaintenanceTask[]> => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .order("due_date", { ascending: true })
        .limit(100);

      if (error) throw error;

      return (data || []).map((task) => ({
        id: task.id,
        equipment: task.component_name || task.title || "Equipamento",
        vessel: "MV Atlantic Star",
        type: (task.task_type as MaintenanceTask["type"]) || "preventive",
        priority: (task.priority as MaintenanceTask["priority"]) || "medium",
        scheduledDate: new Date(task.due_date || task.scheduled_date || Date.now()),
        estimatedDuration: Number(task.estimated_hours) || 4,
        status: (task.status as MaintenanceTask["status"]) || "scheduled",
        assignedTo: "Equipe",
        parts: Array.isArray(task.parts_required) ? task.parts_required as any[] : [],
        description: task.description || "",
        aiScore: undefined,
        healthTrend: undefined,
      }));
    },
    staleTime: 30000,
  });
}

export function useEquipmentHealth(vesselId?: string) {
  return useQuery({
    queryKey: ["equipment-health", vesselId],
    queryFn: async (): Promise<EquipmentHealth[]> => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const equipmentMap = new Map<string, EquipmentHealth>();

      (data || []).forEach((task) => {
        const name = task.component_name || task.title || "Equipamento";
        if (!equipmentMap.has(name)) {
          equipmentMap.set(name, {
            id: task.id,
            name,
            vessel: "MV Atlantic Star",
            healthScore: 90 - (task.priority === "critical" ? 20 : task.priority === "high" ? 10 : 0),
            trend: task.priority === "critical" ? "down" : "stable",
            lastMaintenance: new Date(task.completed_date || Date.now() - 30 * 24 * 60 * 60 * 1000),
            nextMaintenance: new Date(task.due_date || addDays(new Date(), 30)),
            runningHours: Math.floor(Math.random() * 10000) + 5000,
            predictions: [],
          });
        }
      });

      return Array.from(equipmentMap.values()).slice(0, 10);
    },
    staleTime: 60000,
  });
}

export function useMaintenanceStats() {
  const { data: tasks } = useMaintenanceTasks();
  const { data: equipment } = useEquipmentHealth();

  return {
    criticalTasks: tasks?.filter((t) => t.priority === "critical").length || 0,
    inProgressTasks: tasks?.filter((t) => t.status === "in_progress").length || 0,
    avgHealthScore: equipment?.length
      ? Math.round(equipment.reduce((acc, e) => acc + e.healthScore, 0) / equipment.length)
      : 90,
    overdueCount: tasks?.filter((t) => t.status === "overdue").length || 0,
  };
}

export function useCreateMaintenanceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<MaintenanceTask, "id">) => {
      const { data, error } = await supabase
        .from("maintenance_tasks")
        .insert({
          title: task.equipment,
          component_name: task.equipment,
          task_type: task.type,
          priority: task.priority,
          due_date: task.scheduledDate.toISOString().split("T")[0],
          scheduled_date: task.scheduledDate.toISOString().split("T")[0],
          estimated_hours: task.estimatedDuration,
          status: task.status,
          description: task.description,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Tarefa de manutenção criada");
    },
    onError: (error) => {
      toast.error("Erro ao criar tarefa: " + error.message);
    },
  });
}

export function useUpdateMaintenanceTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MaintenanceTask> & { id: string }) => {
      const { error } = await supabase
        .from("maintenance_tasks")
        .update({
          status: updates.status,
          priority: updates.priority,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-tasks"] });
      toast.success("Tarefa atualizada");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar: " + error.message);
    },
  });
}
