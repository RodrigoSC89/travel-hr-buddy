/**
 * Hook para Gestão de Resíduos - dados reais do Supabase
 * Substitui mockTanks e mockRecords em waste-management
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WasteTank {
  id: string;
  name: string;
  type: "oily" | "sewage" | "garbage" | "bilge";
  capacity: number;
  currentLevel: number;
  unit: string;
  status: "ok" | "warning" | "critical";
  lastDischarge: string;
  vesselId?: string;
}

export interface DischargeRecord {
  id: string;
  date: string;
  type: string;
  quantity: number;
  unit: string;
  location: string;
  method: string;
  certificate: string;
}

function mapTankStatus(level: number, capacity: number): WasteTank["status"] {
  const percentage = (level / capacity) * 100;
  if (percentage >= 90) return "critical";
  if (percentage >= 70) return "warning";
  return "ok";
}

export function useWasteTanks() {
  return useQuery({
    queryKey: ["waste-tanks"],
    queryFn: async (): Promise<WasteTank[]> => {
      // Try inventory_items with waste category or equipment_sensors
      const { data: sensors, error: sensorsError } = await supabase
        .from("equipment_sensors")
        .select("*")
        .or("sensor_type.ilike.%tank%,sensor_type.ilike.%waste%,sensor_type.ilike.%oil%,sensor_type.ilike.%bilge%")
        .limit(20);

      if (!sensorsError && sensors && sensors.length > 0) {
        return sensors.map((sensor) => {
          const capacity = (sensor.max_threshold as number) || 5000;
          const currentLevel = (sensor.value as number) || 0;
          
          return {
            id: sensor.id,
            name: sensor.sensor_type || "Tanque",
            type: inferTankType(sensor.sensor_type),
            capacity,
            currentLevel,
            unit: sensor.unit || "L",
            status: mapTankStatus(currentLevel, capacity),
            lastDischarge: sensor.recorded_at?.split("T")[0] || new Date().toISOString().split("T")[0],
            vesselId: sensor.vessel_id || undefined,
          };
        });
      }

      // No sensor data found - return empty array for EmptyState
      return [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

function inferTankType(sensorType: string | null): WasteTank["type"] {
  const lower = sensorType?.toLowerCase() || "";
  if (lower.includes("oil") || lower.includes("oleo")) return "oily";
  if (lower.includes("sewage") || lower.includes("esgoto")) return "sewage";
  if (lower.includes("bilge") || lower.includes("porao")) return "bilge";
  if (lower.includes("garbage") || lower.includes("residuo")) return "garbage";
  return "oily";
}

export function useDischargeRecords() {
  return useQuery({
    queryKey: ["discharge-records"],
    queryFn: async (): Promise<DischargeRecord[]> => {
      // Try logs table for discharge events
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .or("module.eq.waste,module.eq.discharge,module.ilike.%marpol%")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        return data.map((log) => {
          const metadata = log.metadata as Record<string, unknown> || {};
          return {
            id: log.id,
            date: log.created_at?.split("T")[0] || "",
            type: (metadata.type as string) || log.message || "Descarte",
            quantity: (metadata.quantity as number) || 0,
            unit: (metadata.unit as string) || "L",
            location: (metadata.location as string) || "Porto",
            method: (metadata.method as string) || "Empresa credenciada",
            certificate: (metadata.certificate as string) || `CERT-${new Date().getFullYear()}-${log.id.slice(0, 4)}`,
          };
        });
      }

      // No discharge records - return empty for EmptyState
      return [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useWasteManagementData() {
  const tanksQuery = useWasteTanks();
  const recordsQuery = useDischargeRecords();
  const queryClient = useQueryClient();

  const tanks = tanksQuery.data || [];
  const records = recordsQuery.data || [];

  const criticalTanks = tanks.filter((t) => t.status === "critical").length;
  const warningTanks = tanks.filter((t) => t.status === "warning").length;

  const createDischarge = useMutation({
    mutationFn: async (record: Omit<DischargeRecord, "id">) => {
      const { data, error } = await supabase.from("logs").insert({
        module: "waste",
        level: "info",
        message: `Descarte: ${record.type}`,
        metadata: {
          type: record.type,
          quantity: record.quantity,
          unit: record.unit,
          location: record.location,
          method: record.method,
          certificate: record.certificate,
        },
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discharge-records"] });
      toast.success("Descarte registrado com sucesso");
    },
    onError: () => toast.error("Erro ao registrar descarte"),
  });

  return {
    tanks,
    records,
    criticalTanks,
    warningTanks,
    isLoading: tanksQuery.isLoading || recordsQuery.isLoading,
    error: tanksQuery.error || recordsQuery.error,
    refetch: () => {
      tanksQuery.refetch();
      recordsQuery.refetch();
    },
    createDischarge,
  };
}
