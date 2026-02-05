/**
 * Hook para dados MARPOL Compliance - Dados reais do Supabase
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TankLevel {
  id: string;
  name: string;
  type: "slop" | "sludge" | "bilge" | "sewage" | "garbage";
  currentLevel: number;
  capacity: number;
  unit: string;
  lastUpdated: Date;
  status: "ok" | "warning" | "critical";
}

export interface ComplianceAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  description: string;
  regulation: string;
  deadline?: Date;
  resolved: boolean;
}

export interface WasteRecord {
  id: string;
  type: "oil" | "garbage" | "sewage" | "ballast";
  category: string;
  quantity: number;
  unit: string;
  action: "retained" | "discharged" | "incinerated" | "landed";
  location: string;
  date: Date;
  officerName: string;
  remarks?: string;
}

export function useMARPOLTanks(vesselId?: string) {
  return useQuery({
    queryKey: ["marpol-tanks", vesselId],
    queryFn: async (): Promise<TankLevel[]> => {
      const { data, error } = await supabase
        .from("waste_tanks")
        .select("*")
        .order("tank_name");

      if (error) throw error;

      return (data || []).map((tank) => ({
        id: tank.id,
        name: tank.tank_name || `Tank ${tank.id}`,
        type: (tank.tank_type as TankLevel["type"]) || "slop",
        currentLevel: Number(tank.current_level) || 0,
        capacity: Number(tank.capacity) || 100,
        unit: tank.unit || "m³",
        lastUpdated: new Date(tank.last_reading_at || tank.updated_at || Date.now()),
        status: (tank.status as TankLevel["status"]) || getStatus(Number(tank.current_level) || 0, Number(tank.capacity) || 100),
      }));
    },
    staleTime: 30000,
  });
}

export function useMARPOLAlerts(vesselId?: string) {
  return useQuery({
    queryKey: ["marpol-alerts", vesselId],
    queryFn: async (): Promise<ComplianceAlert[]> => {
      const { data: tanks } = await supabase
        .from("waste_tanks")
        .select("*");

      const alerts: ComplianceAlert[] = [];
      
      (tanks || []).forEach((tank) => {
        const percentage = Number(tank.level_percentage) || ((Number(tank.current_level) || 0) / (Number(tank.capacity) || 100)) * 100;
        
        if (percentage >= 85) {
          alerts.push({
            id: `alert-${tank.id}`,
            type: "error",
            title: `${tank.tank_name} Próximo da Capacidade`,
            description: `O tanque está em ${Math.round(percentage)}% da capacidade. Providencie descarga.`,
            regulation: "MARPOL Annex I",
            deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            resolved: false,
          });
        } else if (percentage >= 70) {
          alerts.push({
            id: `alert-${tank.id}`,
            type: "warning",
            title: `${tank.tank_name} Atenção`,
            description: `O tanque está em ${Math.round(percentage)}% da capacidade.`,
            regulation: "MARPOL Annex I",
            resolved: false,
          });
        }
      });

      return alerts;
    },
    staleTime: 30000,
  });
}

export function useMARPOLRecords(vesselId?: string) {
  return useQuery({
    queryKey: ["marpol-records", vesselId],
    queryFn: async (): Promise<WasteRecord[]> => {
      const { data, error } = await supabase
        .from("waste_tanks")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((record) => ({
        id: record.id,
        type: (record.tank_type as WasteRecord["type"]) || "garbage",
        category: record.tank_name || "General",
        quantity: Number(record.last_discharge_quantity) || Number(record.current_level) || 0,
        unit: record.unit || "m³",
        action: record.last_discharge_location ? "landed" as const : "retained" as const,
        location: record.last_discharge_location || record.vessel_name || "Unknown",
        date: new Date(record.last_discharge_date || record.updated_at || Date.now()),
        officerName: "Oficial de Serviço",
        remarks: undefined,
      }));
    },
    staleTime: 30000,
  });
}

export function useCreateWasteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (record: Omit<WasteRecord, "id">) => {
      const { data, error } = await supabase
        .from("waste_tanks")
        .insert({
          tank_name: record.category,
          tank_type: record.type,
          current_level: record.quantity,
          unit: record.unit,
          vessel_name: record.location,
          capacity: record.quantity * 2,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marpol-records"] });
      queryClient.invalidateQueries({ queryKey: ["marpol-tanks"] });
      toast.success("Registro de descarte criado com sucesso");
    },
    onError: (error) => {
      toast.error("Erro ao criar registro: " + error.message);
    },
  });
}

function getStatus(current: number, capacity: number): "ok" | "warning" | "critical" {
  const percentage = (current / capacity) * 100;
  if (percentage >= 85) return "critical";
  if (percentage >= 70) return "warning";
  return "ok";
}
