/**
 * Hook para histórico de manutenção real
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MaintenanceRecord {
  id: string;
  title: string;
  vesselName: string;
  systemName: string;
  completedAt: Date;
  type: "preventiva" | "corretiva" | "preditiva";
  status: "concluido" | "parcial";
  technician: string;
  hours: number;
  cost: number;
}

function mapMaintenanceType(type: string | null): MaintenanceRecord["type"] {
  const typeLower = type?.toLowerCase() || "";
  if (typeLower.includes("prevent") || typeLower === "scheduled") return "preventiva";
  if (typeLower.includes("corret") || typeLower === "corrective") return "corretiva";
  if (typeLower.includes("predit") || typeLower === "predictive") return "preditiva";
  return "preventiva";
}

function mapMaintenanceStatus(status: string | null): MaintenanceRecord["status"] {
  const statusLower = status?.toLowerCase() || "";
  if (statusLower === "completed" || statusLower === "concluido" || statusLower === "done") {
    return "concluido";
  }
  return "parcial";
}

export function useMaintenanceHistoryRealData() {
  // Fetch maintenance records
  const { data: history = [], isLoading, refetch } = useQuery({
    queryKey: ["maintenance-history"],
    queryFn: async (): Promise<MaintenanceRecord[]> => {
      // Fetch completed maintenance records
      const { data: maintenanceData, error: maintenanceError } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          vessels:vessel_id(name)
        `)
        .in("status", ["completed", "done", "concluido", "partial", "parcial"])
        .order("completed_date", { ascending: false })
        .limit(100);

      if (maintenanceError) throw maintenanceError;

      return (maintenanceData || []).map(record => ({
        id: record.id,
        title: record.description || "Manutenção",
        vesselName: (record.vessels as Record<string, unknown> | null)?.name as string || "Embarcação",
        systemName: record.maintenance_type || "Sistema Geral",
        completedAt: new Date(record.completed_date || record.scheduled_date || Date.now()),
        type: mapMaintenanceType(record.maintenance_type),
        status: mapMaintenanceStatus(record.status),
        technician: record.assigned_technician || "Técnico",
        hours: record.actual_duration || 0,
        cost: record.actual_cost || 0,
      }));
    },
    staleTime: 60000,
  });

  // Stats
  const totalCost = history.reduce((acc, record) => acc + record.cost, 0);
  const totalHours = history.reduce((acc, record) => acc + record.hours, 0);
  const completedCount = history.filter(r => r.status === "concluido").length;

  return {
    history,
    isLoading,
    refetch,
    stats: {
      totalRecords: history.length,
      totalHours,
      totalCost,
      completedCount,
      byType: {
        preventiva: history.filter(r => r.type === "preventiva").length,
        corretiva: history.filter(r => r.type === "corretiva").length,
        preditiva: history.filter(r => r.type === "preditiva").length,
      },
    },
  };
}
