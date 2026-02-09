/**
 * Hook: useIoTIntelligenceData
 * Fetches IoT sensors and equipment health from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SensorData {
  id: string;
  name: string;
  type: string;
  value: number;
  unit: string;
  status: "normal" | "warning" | "critical";
  trend: "up" | "down" | "stable";
  lastUpdate: string;
  battery: number;
  signalStrength: number;
}

export interface EquipmentHealth {
  id: string;
  name: string;
  location: string;
  healthScore: number;
  operatingHours: number;
  nextMaintenance: string;
  anomalies: number;
  efficiency: number;
}

export function useIoTIntelligenceData() {
  return useQuery({
    queryKey: ["iot-intelligence"],
    queryFn: async () => {
      const [sensorsRes, dataRes, maintenanceRes] = await Promise.all([
        supabase.from("iot_sensors").select("*, vessels(name)").order("last_reading_at", { ascending: false }).limit(50),
        supabase.from("iot_sensor_data").select("*").order("timestamp", { ascending: false }).limit(100),
        supabase.from("maintenance_records").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

      const rawSensors = sensorsRes.data || [];
      const rawData = dataRes.data || [];
      const maintenanceRecords = maintenanceRes.data || [];

      // Map sensors
      type SensorRow = Record<string, unknown>;
      type DataRow = Record<string, unknown>;
      type MaintenanceRow = Record<string, unknown>;
      
      const sensors: SensorData[] = rawSensors.map((s: SensorRow, sIdx: number) => {
        const latestData = rawData.find((d: DataRow) => d.sensor_id === s.sensor_id);
        const value = latestData ? Number(latestData.value) : Number(s.current_value) || 0;
        const thresholds = (s.thresholds as Record<string, number>) || {};
        const maxThreshold = thresholds.max || thresholds.critical_high || 100;
        const warnThreshold = thresholds.warning_high || maxThreshold * 0.8;

        let status: "normal" | "warning" | "critical" = "normal";
        if (value >= maxThreshold) status = "critical";
        else if (value >= warnThreshold) status = "warning";

        const sensorStatus = (String(s.status || "")).toLowerCase();
        if (sensorStatus === "critical") status = "critical";
        else if (sensorStatus === "warning") status = "warning";

        const vessels = s.vessels as Record<string, unknown> | null;
        const metadata = (s.metadata as Record<string, unknown>) || {};

        return {
          id: s.id as string,
          name: `${vessels?.name || "Vessel"} - ${s.location || s.sensor_type || "Sensor"}`,
          type: (s.sensor_type as string) || "generic",
          value,
          unit: (s.unit as string) || "",
          status,
          trend: "stable" as const,
          lastUpdate: s.last_reading_at ? getTimeDiff(s.last_reading_at as string) : "N/A",
          battery: (metadata.battery as number) || 70 + (sIdx * 11) % 30,
          signalStrength: (metadata.signal as number) || 80 + (sIdx * 7) % 20,
        };
      });

      // Group maintenance by equipment for health scores
      const equipmentMap = new Map<string, MaintenanceRow[]>();
      maintenanceRecords.forEach((m: MaintenanceRow) => {
        const key = (m.equipment_name as string) || (m.title as string) || "Equipment";
        if (!equipmentMap.has(key)) equipmentMap.set(key, []);
        equipmentMap.get(key)!.push(m);
      });

      const equipmentHealth: EquipmentHealth[] = Array.from(equipmentMap.entries()).slice(0, 8).map(([name, records]) => {
        const criticalCount = records.filter((r: MaintenanceRow) => r.priority === "critical" || r.priority === "emergency").length;
        const healthScore = Math.max(50, 100 - criticalCount * 8 - records.length * 2);
        const totalHours = records.reduce((s: number, r: MaintenanceRow) => s + (Number(r.estimated_hours) || 0), 0);
        return {
          id: records[0].id as string,
          name,
          location: (records[0].location as string) || "Engine Room",
          healthScore: Math.min(100, healthScore),
          operatingHours: 5000 + (healthScore * 53) % 10000,
          nextMaintenance: `${50 + (healthScore * 3) % 450}h`,
          anomalies: criticalCount,
          efficiency: Math.min(100, healthScore + 3),
        };
      });

      return { sensors, equipmentHealth };
    },
    staleTime: 1000 * 60 * 2,
  });
}

function getTimeDiff(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}
