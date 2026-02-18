/**
 * Tracking & Telemetry Data Hook - Full Backend Integration
 * PATCH TRACKING-2.0
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAcknowledgeAlertIntegrated, useCreateTelemetryAlert } from "@/hooks/useModuleHooks";

export interface VesselPosition {
  id: string;
  vessel_id: string;
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  timestamp: string;
  source: string | null;
}

export interface SensorReading {
  id: string;
  vessel_id: string;
  sensor_type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: string;
}

export interface TelemetryAlert {
  id: string;
  vessel_id: string | null;
  alert_type: string;
  severity: string;
  message: string;
  acknowledged: boolean;
  created_at: string;
}

export function useTrackingTelemetryData() {

  // Fetch vessel positions
  const { data: positions = [], isLoading: positionsLoading } = useQuery({
    queryKey: ["tracking-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessel_positions")
        .select(`
          *,
          vessels:vessel_id (name, imo_number, status)
        `)
        .order("timestamp", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10000, // Refresh every 10 seconds for real-time
    refetchInterval: 30000,
  });

  // Fetch sensor readings
  const { data: sensorReadings = [], isLoading: sensorsLoading } = useQuery({
    queryKey: ["tracking-sensors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sensor_readings")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(500);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15000,
    refetchInterval: 60000,
  });

  // Fetch telemetry alerts
  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["tracking-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telemetry_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 10000,
    refetchInterval: 30000,
  });

  // Satellite connections from satcom_connection_status
  const { data: satellites = [], isLoading: satellitesLoading } = useQuery({
    queryKey: ["tracking-satellites"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("satcom_connection_status")
        .select("id, link_id, is_connected, signal_quality, latency_ms, last_check_at")
        .order("last_check_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!data?.length) return [];

      // Fetch link names
      const linkIds = [...new Set(data.map(d => d.link_id).filter((id): id is string => id != null))];
      let linkMap: Record<string, string> = {};

      if (linkIds.length > 0) {
        const { data: links } = await supabase
          .from("satcom_links")
          .select("id, provider")
          .in("id", linkIds);

        (links || []).forEach((l) => {
          linkMap[l.id] = l.provider || "SATCOM";
        });
      }

      return data.map((s) => ({
        id: s.id,
        name: linkMap[s.link_id || ""] || "SATCOM Link",
        status: s.is_connected ? "connected" : "disconnected",
        signal_quality: s.signal_quality,
        latency_ms: s.latency_ms || 0,
        last_sync: s.last_check_at || new Date().toISOString(),
      }));
    },
    staleTime: 15000,
    refetchInterval: 30000,
  });

  // Fetch vessels for tracking
  const { data: vessels = [], isLoading: vesselsLoading } = useQuery({
    queryKey: ["tracking-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, status, current_location, vessel_type")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Integrated mutations
  const acknowledgeAlert = useAcknowledgeAlertIntegrated();
  const createAlert = useCreateTelemetryAlert();

  // Calculate telemetry metrics
  const telemetryMetrics = {
    trackedVessels: vessels.length,
    activeConnections: satellites.filter((s) => s.status === "connected" || s.status === "active").length,
    totalSensors: new Set(sensorReadings.map((s) => s.sensor_id)).size,
    unacknowledgedAlerts: alerts.filter((a) => !a.acknowledged).length,
    criticalAlerts: alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length,
    avgLatency: satellites.length > 0 
      ? Math.round(satellites.reduce((sum: number, s) => sum + (s.latency_ms || 0), 0) / satellites.length) 
      : 0,
    systemUptime: 99.9, // Would be calculated from actual data
    lastUpdate: new Date().toISOString(),
  };

  // Get latest position for each vessel
  const latestPositions = vessels.map((vessel) => {
    const vesselPositions = positions.filter((p) => p.vessel_id === vessel.id);
    const latest = vesselPositions[0];
    return {
      ...vessel,
      position: latest ? {
        latitude: latest.latitude,
        longitude: latest.longitude,
        speed: latest.speed,
        heading: latest.heading,
        timestamp: latest.created_at,
      } : null,
    };
  });

  // Get sensor data by type
  const getSensorsByType = (type: string) => {
    return sensorReadings.filter((s) => s.sensor_id === type);
  };

  return {
    // Data
    positions,
    latestPositions,
    sensorReadings,
    alerts,
    satellites,
    vessels,
    metrics: telemetryMetrics,
    
    // Loading states
    isLoading: positionsLoading || sensorsLoading || alertsLoading || satellitesLoading || vesselsLoading,
    positionsLoading,
    sensorsLoading,
    alertsLoading,
    satellitesLoading,
    vesselsLoading,
    
    // Utilities
    getSensorsByType,
    
    // Mutations
    acknowledgeAlert,
    createAlert,
  };
}

export default useTrackingTelemetryData;
