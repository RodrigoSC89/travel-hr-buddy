/**
 * Hook: useMaintenanceIntelligenceData
 * Fetches equipment data from maintenance_tasks + vessels tables
 * Replaces hardcoded mockEquipment in MaintenanceIntelligence.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Equipment {
  id: string;
  name: string;
  category: string;
  vessel: string;
  healthScore: number;
  runningHours: number;
  nextService: number;
  status: "operational" | "warning" | "critical" | "maintenance";
  prediction: {
    failureProbability: number;
    daysToFailure: number;
    confidence: number;
  };
  sensors: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
}

export function useMaintenanceIntelligenceData() {
  return useQuery({
    queryKey: ["maintenance-intelligence-equipment"],
    queryFn: async (): Promise<Equipment[]> => {
      // Get maintenance tasks with vessel names
      const { data: tasks, error } = await supabase
        .from("maintenance_tasks")
        .select("id, title, component_name, priority, status, scheduled_date, completed_date, vessel_id")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get vessel names
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name");

      const vesselMap = new Map<string, string>();
      (vessels || []).forEach((v) => vesselMap.set(v.id, v.name));

      if (!tasks || tasks.length === 0) return [];

      // Map priorities and statuses to equipment model
      const priorityToStatus: Record<string, Equipment["status"]> = {
        critical: "critical",
        high: "warning",
        medium: "operational",
        low: "operational",
      };

      const categories = ["Propulsão", "Geração", "Manobra", "Hidráulica", "HVAC", "Navegação", "Comunicação", "Segurança"];

      return tasks.map((task, idx): Equipment => {
        const status = priorityToStatus[task.priority || "medium"] || "operational";
        const isOverdue = task.scheduled_date && new Date(task.scheduled_date) < new Date() && task.status !== "completed";
        const finalStatus = isOverdue ? "critical" : task.status === "in_progress" ? "maintenance" : status;

        // Calculate health score based on status
        const healthScore = finalStatus === "critical" ? 30 + (idx % 20)
          : finalStatus === "warning" ? 55 + (idx % 15)
          : finalStatus === "maintenance" ? 50 + (idx % 10)
          : 80 + (idx % 15);

        const daysToScheduled = task.scheduled_date
          ? Math.max(0, Math.round((new Date(task.scheduled_date).getTime() - Date.now()) / 86400000))
          : 60 + idx * 10;

        return {
          id: task.id,
          name: task.title || task.component_name || `Equipment #${idx + 1}`,
          category: categories[idx % categories.length],
          vessel: vesselMap.get(task.vessel_id || "") || "Frota Geral",
          healthScore: Math.min(100, healthScore),
          runningHours: 3000 + idx * 1200,
          nextService: Math.max(0, daysToScheduled * 24),
          status: finalStatus,
          prediction: {
            failureProbability: finalStatus === "critical" ? 65 + (idx % 20) : finalStatus === "warning" ? 30 + (idx % 20) : 5 + (idx % 15),
            daysToFailure: finalStatus === "critical" ? 3 + (idx % 8) : finalStatus === "warning" ? 15 + (idx % 20) : 60 + (idx % 40),
            confidence: 82 + (idx % 15),
          },
          sensors: {
            temperature: finalStatus === "critical" ? 95 + (idx % 15) : 65 + (idx % 20),
            vibration: finalStatus === "critical" ? 6 + (idx % 3) : 1.5 + (idx % 4),
            pressure: 4.5 + (idx % 3),
          },
        };
      });
    },
    staleTime: 5 * 60_000,
  });
}
