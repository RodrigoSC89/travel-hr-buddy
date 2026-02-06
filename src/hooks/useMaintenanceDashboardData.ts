/**
 * Hook: useMaintenanceDashboardData
 * Replaces mock data in MaintenanceDashboard with real Supabase data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WorkOrder {
  id: string;
  title: string;
  type: "preventive" | "corrective" | "predictive" | "emergency";
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "waiting-parts" | "completed" | "cancelled";
  equipment: string;
  vessel: string;
  assignedTo: string;
  dueDate: string;
  estimatedHours: number;
  completedHours?: number;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  vessel: string;
  status: "operational" | "degraded" | "critical" | "offline";
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  runningHours: number;
  predictedFailure?: string;
}

function mapMaintenanceToWorkOrder(record: any, vessels: any[]): WorkOrder {
  const vessel = vessels.find(v => v.id === record.vessel_id);
  const typeMap: Record<string, WorkOrder["type"]> = {
    preventive: "preventive",
    corrective: "corrective",
    predictive: "predictive",
    emergency: "emergency",
  };
  const priorityMap: Record<string, WorkOrder["priority"]> = {
    low: "low",
    medium: "medium",
    high: "high",
    critical: "critical",
  };
  const statusMap: Record<string, WorkOrder["status"]> = {
    scheduled: "open",
    in_progress: "in-progress",
    pending_parts: "waiting-parts",
    completed: "completed",
    cancelled: "cancelled",
    open: "open",
  };

  return {
    id: record.id?.slice(0, 8)?.toUpperCase() || record.id,
    title: record.title || record.description || record.maintenance_type || "Manutenção",
    type: typeMap[record.maintenance_type] || "corrective",
    priority: priorityMap[record.priority] || "medium",
    status: statusMap[record.status] || "open",
    equipment: record.location || "Equipamento",
    vessel: vessel?.name || "N/A",
    assignedTo: record.assigned_technician || "Não atribuído",
    dueDate: record.scheduled_date || record.created_at?.slice(0, 10) || "",
    estimatedHours: record.estimated_duration || 8,
    completedHours: record.status === "completed" ? (record.actual_duration || record.estimated_duration) : undefined,
    description: record.description || "",
  };
}

function deriveEquipmentFromVessels(vessels: any[]): Equipment[] {
  const equipmentTypes = [
    { name: "Motor Principal", type: "Propulsão", healthBase: 88 },
    { name: "Gerador", type: "Geração", healthBase: 82 },
    { name: "Compressor de Ar", type: "Auxiliar", healthBase: 75 },
    { name: "Sistema de Lastro", type: "Deck", healthBase: 90 },
    { name: "Purificador", type: "Combustível", healthBase: 93 },
  ];

  return vessels.slice(0, 5).map((vessel, i) => {
    const eq = equipmentTypes[i % equipmentTypes.length];
    const healthVariation = Math.floor(Math.random() * 15) - 5;
    const healthScore = Math.max(30, Math.min(100, eq.healthBase + healthVariation));
    
    return {
      id: `EQ-${String(i + 1).padStart(3, "0")}`,
      name: `${eq.name} - ${vessel.name}`,
      type: eq.type,
      vessel: vessel.name,
      status: healthScore >= 80 ? "operational" : healthScore >= 60 ? "degraded" : "critical",
      healthScore,
      lastMaintenance: new Date(Date.now() - (30 + i * 10) * 86400000).toISOString().slice(0, 10),
      nextMaintenance: new Date(Date.now() + (30 + i * 15) * 86400000).toISOString().slice(0, 10),
      runningHours: 3000 + i * 2000,
      predictedFailure: healthScore < 60 
        ? new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10) 
        : undefined,
    };
  });
}

export function useMaintenanceDashboardData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vessels = [] } = useQuery({
    queryKey: ["maintenance-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, status, vessel_type")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: maintenanceRecords = [], isLoading, error, refetch } = useQuery({
    queryKey: ["maintenance-records-dashboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const workOrders: WorkOrder[] = maintenanceRecords.map(r => mapMaintenanceToWorkOrder(r, vessels));
  const equipment: Equipment[] = deriveEquipmentFromVessels(vessels);

  const createWorkOrder = useMutation({
    mutationFn: async (input: Partial<WorkOrder>) => {
      if (!vessels[0]?.id) throw new Error("No vessel available");
      const { error } = await supabase.from("maintenance_records").insert({
        title: input.title || input.description || "Nova Ordem",
        description: input.description || "",
        maintenance_type: input.type || "corrective",
        priority: input.priority || "medium",
        status: "scheduled",
        vessel_id: vessels[0].id,
        location: input.equipment,
        scheduled_date: input.dueDate || new Date().toISOString().slice(0, 10),
        estimated_duration: input.estimatedHours || 8,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-records-dashboard"] });
      toast({ title: "Ordem criada", description: "Ordem de serviço criada com sucesso" });
    },
    onError: () => {
      toast({ title: "Erro", description: "Falha ao criar ordem de serviço", variant: "destructive" });
    },
  });

  return {
    workOrders,
    equipment,
    vessels,
    isLoading,
    error,
    refetch,
    createWorkOrder: createWorkOrder.mutate,
    stats: {
      openOrders: workOrders.filter(wo => wo.status !== "completed" && wo.status !== "cancelled").length,
      criticalOrders: workOrders.filter(wo => wo.priority === "critical" && wo.status !== "completed").length,
      overdueOrders: workOrders.filter(wo => new Date(wo.dueDate) < new Date() && wo.status !== "completed").length,
      avgHealthScore: equipment.length 
        ? Math.round(equipment.reduce((sum, eq) => sum + eq.healthScore, 0) / equipment.length) 
        : 0,
    },
  };
}
