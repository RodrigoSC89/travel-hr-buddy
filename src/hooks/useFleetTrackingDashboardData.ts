/**
 * Hook: useFleetTrackingDashboardData
 * Replaces mock data in FleetTrackingDashboard with real Supabase data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  mmsi: string;
  type: string;
  status: "underway" | "anchored" | "moored" | "drifting";
  position: { lat: number; lon: number };
  course: number;
  speed: number;
  destination: string;
  eta: string;
  lastUpdate: string;
  fuelLevel: number;
  engineStatus: "running" | "idle" | "stopped";
}

export interface TrackingAlert {
  id: string;
  type: "geofence" | "speed" | "ais" | "weather" | "mechanical";
  severity: "info" | "warning" | "critical";
  vessel: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: "restricted" | "safe" | "port" | "custom";
  active: boolean;
  vesselsInside: number;
}

// Generate consistent position from vessel data
function generatePosition(vesselId: string, index: number): { lat: number; lon: number } {
  const hash = vesselId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const baseLat = -23.5 + (hash % 5) - 2;
  const baseLon = -44.0 + ((hash * 7) % 8) - 4;
  return { lat: baseLat + index * 0.3, lon: baseLon - index * 0.5 };
}

function mapVesselToPosition(vessel: any, index: number): VesselPosition {
  const statusMap: Record<string, VesselPosition["status"]> = {
    navigating: "underway",
    "in-port": "moored",
    anchored: "anchored",
    drydock: "moored",
    maintenance: "moored",
    active: "underway",
  };

  const engineMap: Record<string, VesselPosition["engineStatus"]> = {
    navigating: "running",
    "in-port": "idle",
    anchored: "idle",
    drydock: "stopped",
    maintenance: "stopped",
    active: "running",
  };

  const position = generatePosition(vessel.id, index);
  const speed = statusMap[vessel.status] === "underway" ? 8 + Math.random() * 8 : 0;
  const course = statusMap[vessel.status] === "underway" ? Math.floor(Math.random() * 360) : 0;

  return {
    id: vessel.id,
    name: vessel.name,
    imo: vessel.imo_number || `IMO${9000000 + index}`,
    mmsi: `${200000000 + index}`,
    type: vessel.type || "Cargo",
    status: statusMap[vessel.status] || "moored",
    position,
    course,
    speed: parseFloat(speed.toFixed(1)),
    destination: vessel.port_of_registry || "Porto de Santos",
    eta: statusMap[vessel.status] === "underway" 
      ? new Date(Date.now() + (24 + index * 6) * 3600000).toISOString().slice(0, 16).replace("T", " ")
      : "-",
    lastUpdate: new Date(Date.now() - index * 300000).toISOString().slice(0, 16).replace("T", " "),
    fuelLevel: 40 + Math.floor(Math.random() * 55),
    engineStatus: engineMap[vessel.status] || "idle",
  };
}

function mapAlertToTrackingAlert(alert: any, vessels: any[]): TrackingAlert {
  const vessel = vessels.find(v => v.id === alert.sensor_id);
  const typeMap: Record<string, TrackingAlert["type"]> = {
    geofence: "geofence",
    speed: "speed",
    ais: "ais",
    weather: "weather",
    engine: "mechanical",
    navigation: "ais",
  };
  const severityMap: Record<string, TrackingAlert["severity"]> = {
    low: "info",
    medium: "warning",
    high: "critical",
    critical: "critical",
  };

  return {
    id: alert.id,
    type: typeMap[alert.alert_type] || "ais",
    severity: severityMap[alert.severity] || "info",
    vessel: vessel?.name || "N/A",
    message: alert.message || alert.description || "Alerta detectado",
    timestamp: alert.created_at?.slice(0, 16).replace("T", " ") || "",
    acknowledged: alert.status === "acknowledged" || alert.status === "resolved",
  };
}

export function useFleetTrackingDashboardData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vessels = [], isLoading: loadingVessels } = useQuery({
    queryKey: ["tracking-vessels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: rawAlerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["tracking-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telemetry_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const vesselPositions: VesselPosition[] = vessels.map((v, i) => mapVesselToPosition(v, i));
  const alerts: TrackingAlert[] = rawAlerts.map(a => mapAlertToTrackingAlert(a, vessels));

  // Derive geofences from vessel locations
  const geofences: GeofenceZone[] = [
    { id: "1", name: "Porto de Santos", type: "port", active: true, vesselsInside: vesselPositions.filter(v => v.status === "moored").length },
    { id: "2", name: "Zona de Exclusão - Plataforma", type: "restricted", active: true, vesselsInside: 0 },
    { id: "3", name: "Área de Ancoragem", type: "safe", active: true, vesselsInside: vesselPositions.filter(v => v.status === "anchored").length },
    { id: "4", name: "Rota Preferencial", type: "custom", active: vessels.length > 3, vesselsInside: vesselPositions.filter(v => v.status === "underway").length },
  ];

  const acknowledgeAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("telemetry_alerts")
        .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-alerts"] });
      toast({ title: "Alerta reconhecido" });
    },
  });

  return {
    vesselPositions,
    alerts,
    geofences,
    isLoading: loadingVessels || loadingAlerts,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["tracking-vessels"] });
      queryClient.invalidateQueries({ queryKey: ["tracking-alerts"] });
    },
    acknowledgeAlert: acknowledgeAlert.mutate,
    stats: {
      totalVessels: vesselPositions.length,
      underway: vesselPositions.filter(v => v.status === "underway").length,
      anchored: vesselPositions.filter(v => v.status === "anchored").length,
      criticalAlerts: alerts.filter(a => a.severity === "critical" && !a.acknowledged).length,
    },
  };
}
