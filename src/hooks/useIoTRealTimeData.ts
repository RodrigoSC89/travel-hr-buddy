/**
 * Hook for real-time IoT sensor data from database
 * Adjusted to match actual iot_sensors table schema
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface IoTSensorData {
  id: string;
  sensor_id: string;
  sensor_type: string;
  vessel_id?: string;
  location?: string;
  current_value: number;
  unit: string;
  status: string;
  last_reading_at?: string;
  thresholds?: { min?: number; max?: number };
  metadata?: Record<string, unknown>;
  organization_id?: string;
}

export interface IoTSensorReading {
  id: string;
  sensor_id: string;
  value: number;
  status: string;
  trend: string;
  recorded_at: string;
}

// Fetch all IoT sensors
export function useIoTSensorsData(vesselId?: string) {
  return useQuery({
    queryKey: ["iot-sensors-real", vesselId],
    queryFn: async () => {
      const query = supabase
        .from("iot_sensors")
        .select("*")
        .order("sensor_id");

      const { data, error } = vesselId 
        ? await query.eq("vessel_id", vesselId)
        : await query;
        
      if (error) throw error;
      
      return (data || []).map((row): IoTSensorData => ({
        id: row.id,
        sensor_id: row.sensor_id,
        sensor_type: row.sensor_type || "generic",
        vessel_id: row.vessel_id ?? undefined,
        location: row.location ?? undefined,
        current_value: Number(row.current_value) || 0,
        unit: row.unit || "",
        status: row.status || "normal",
        last_reading_at: row.last_reading_at ?? undefined,
        thresholds: row.thresholds as IoTSensorData["thresholds"],
        metadata: row.metadata as Record<string, unknown>,
        organization_id: row.organization_id ?? undefined,
      }));
    },
  });
}

// Fetch sensor readings from iot_sensor_readings
export function useIoTReadings(sensorIds?: string[]) {
  return useQuery({
    queryKey: ["iot-readings-real", sensorIds],
    queryFn: async () => {
      const query = supabase
        .from("iot_sensor_readings")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(100);

      const { data, error } = sensorIds?.length
        ? await query.in("sensor_id", sensorIds)
        : await query;

      if (error) throw error;
      
      return (data || []).map((row): IoTSensorReading => ({
        id: row.id,
        sensor_id: row.sensor_id,
        value: Number(row.value),
        status: row.status || "normal",
        trend: row.trend || "stable",
        recorded_at: row.recorded_at || new Date().toISOString(),
      }));
    },
    refetchInterval: 5000,
  });
}

// Combined hook for dashboard
export function useIoTDashboard(vesselId?: string) {
  const { data: sensors, isLoading } = useIoTSensorsData(vesselId);

  const stats = {
    total: sensors?.length ?? 0,
    normal: sensors?.filter((s) => s.status === "normal").length ?? 0,
    warning: sensors?.filter((s) => s.status === "warning").length ?? 0,
    critical: sensors?.filter((s) => s.status === "critical").length ?? 0,
  };

  return { sensors, stats, isLoading };
}
