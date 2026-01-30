/**
 * Hook para dados reais de Embarcações/Sensores
 * Substitui mockVessels do RealTimeMonitor
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface SensorData {
  id: string;
  name: string;
  type: "temperature" | "fuel" | "pressure" | "speed" | "power" | "heading";
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical" | "offline";
  lastUpdate: Date;
  min?: number;
  max?: number;
  target?: number;
}

export interface VesselMonitor {
  vesselId: string;
  vesselName: string;
  isOnline: boolean;
  lastSeen: Date;
  sensors: SensorData[];
}

async function fetchVesselsWithSensors(): Promise<VesselMonitor[]> {
  // Buscar embarcações
  const { data: vessels, error } = await supabase
    .from("vessels")
    .select("id, name, status, imo_number, vessel_type")
    .limit(50);

  if (error) {
    console.error("Error fetching vessels:", error);
    return [];
  }

  if (!vessels || vessels.length === 0) {
    return [];
  }

  // Buscar sensores para cada embarcação
  const vesselIds = vessels.map(v => v.id);
  
  const { data: sensors } = await supabase
    .from("equipment_sensors")
    .select("id, sensor_type, value, unit, is_anomaly, recorded_at, min_threshold, max_threshold, vessel_id")
    .in("vessel_id", vesselIds)
    .order("recorded_at", { ascending: false })
    .limit(200);

  // Agrupar sensores por embarcação
  const sensorsByVessel: Record<string, any[]> = {};
  sensors?.forEach((s: any) => {
    const vesselId = s.vessel_id;
    if (!vesselId) return;
    
    if (!sensorsByVessel[vesselId]) {
      sensorsByVessel[vesselId] = [];
    }
    // Manter apenas o sensor mais recente de cada tipo
    const existingIndex = sensorsByVessel[vesselId].findIndex(
      (existing: any) => existing.sensor_type === s.sensor_type
    );
    if (existingIndex === -1) {
      sensorsByVessel[vesselId].push(s);
    }
  });

  return vessels.map(vessel => {
    const vesselSensors = sensorsByVessel[vessel.id] || [];
    const isOnline = vessel.status === "operational" || vessel.status === "active";

    return {
      vesselId: vessel.id,
      vesselName: vessel.name || `Embarcação ${vessel.imo_number || vessel.id.slice(0, 8)}`,
      isOnline,
      lastSeen: new Date(),
      sensors: vesselSensors.map(s => mapSensor(s, isOnline))
    };
  });
}

function mapSensor(s: any, vesselOnline: boolean): SensorData {
  const sensorType = mapSensorType(s.sensor_type);
  const status = determineSensorStatus(s, vesselOnline);

  return {
    id: s.id,
    name: getSensorName(s.sensor_type),
    type: sensorType,
    value: s.value || 0,
    unit: s.unit || getDefaultUnit(sensorType),
    status,
    lastUpdate: new Date(s.recorded_at || Date.now()),
    min: s.min_threshold,
    max: s.max_threshold
  };
}

function mapSensorType(type: string | null): SensorData["type"] {
  const lowerType = type?.toLowerCase() || "";
  if (lowerType.includes("temp")) return "temperature";
  if (lowerType.includes("fuel") || lowerType.includes("combustivel")) return "fuel";
  if (lowerType.includes("pressure") || lowerType.includes("pressao")) return "pressure";
  if (lowerType.includes("speed") || lowerType.includes("velocidade")) return "speed";
  if (lowerType.includes("power") || lowerType.includes("potencia")) return "power";
  if (lowerType.includes("heading") || lowerType.includes("rumo")) return "heading";
  return "power";
}

function getSensorName(type: string | null): string {
  const lowerType = type?.toLowerCase() || "";
  if (lowerType.includes("temp")) return "Temperatura Motor";
  if (lowerType.includes("fuel")) return "Nível Combustível";
  if (lowerType.includes("pressure")) return "Pressão";
  if (lowerType.includes("speed")) return "Velocidade";
  if (lowerType.includes("power") || lowerType.includes("dp")) return "Potência DP";
  if (lowerType.includes("heading")) return "Rumo";
  return type || "Sensor";
}

function getDefaultUnit(type: SensorData["type"]): string {
  switch (type) {
    case "temperature": return "°C";
    case "fuel": return "%";
    case "pressure": return "bar";
    case "speed": return "kts";
    case "power": return "kW";
    case "heading": return "°";
    default: return "";
  }
}

function determineSensorStatus(sensor: any, vesselOnline: boolean): SensorData["status"] {
  if (!vesselOnline) return "offline";
  if (sensor.is_anomaly) return "critical";
  
  const value = sensor.value || 0;
  const max = sensor.max_threshold;
  const min = sensor.min_threshold;

  if (max && value > max) return "critical";
  if (min && value < min) return "critical";
  if (max && value > max * 0.9) return "warning";
  if (min && value < min * 1.1) return "warning";

  return "normal";
}

// ============================================
// HOOKS EXPORTADOS
// ============================================

export function useVesselsMonitor() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vessels-monitor"],
    queryFn: fetchVesselsWithSensors,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // 1 minute
  });

  // Realtime subscription para updates
  useEffect(() => {
    const channel = supabase
      .channel("vessels-sensors-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment_sensors" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["vessels-monitor"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vessels" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["vessels-monitor"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useVesselStats() {
  const { data: vessels } = useVesselsMonitor();

  const total = vessels?.length || 0;
  const online = vessels?.filter(v => v.isOnline).length || 0;
  const criticalAlerts = vessels?.reduce(
    (count, v) => count + v.sensors.filter(s => s.status === "critical").length,
    0
  ) || 0;
  const activeSensors = vessels?.reduce(
    (count, v) => count + v.sensors.filter(s => s.status !== "offline").length,
    0
  ) || 0;

  return { total, online, criticalAlerts, activeSensors };
}
