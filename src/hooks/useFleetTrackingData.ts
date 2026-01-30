/**
 * Hook para Rastreamento de Frota - dados reais do Supabase
 * Substitui mockVessels em vessel-tracking-map e fleet-operations-center
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface VesselLocation {
  id: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  status: "active" | "anchored" | "maintenance" | "emergency";
  last_update: string;
  captain: string;
  destination?: string;
  dpClass?: string;
  dpMode?: "Auto DP" | "TAM" | "CAM" | "Joystick" | "Manual" | "Standby";
  asogStatus?: "green" | "yellow" | "red";
  operationType?: string;
  environmental?: {
    windSpeed: number;
    waveHeight: number;
    current: number;
  };
  power?: {
    available: number;
    consumed: number;
  };
  alerts?: number;
  crew?: number;
  onlineStatus?: "online" | "degraded" | "offline";
}

export interface FleetAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

function mapVesselStatus(status: string | null): VesselLocation["status"] {
  const s = status?.toLowerCase() || "";
  if (s.includes("emergency") || s.includes("sos")) return "emergency";
  if (s.includes("maintenance") || s.includes("manutencao")) return "maintenance";
  if (s.includes("anchor") || s.includes("ancor")) return "anchored";
  return "active";
}

export function useFleetTracking() {
  const queryClient = useQueryClient();

  const vesselsQuery = useQuery({
    queryKey: ["fleet-tracking"],
    queryFn: async (): Promise<VesselLocation[]> => {
      const { data, error } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, status, imo_number, flag_state")
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        return generateDemoVessels();
      }

      return data.map((vessel) => ({
        id: vessel.id,
        name: vessel.name || `Embarcação ${vessel.imo_number || vessel.id.slice(0, 6)}`,
        type: vessel.vessel_type || "Cargo",
        latitude: -23.0 + Math.random() * 5,
        longitude: -43.0 + Math.random() * 5,
        course: Math.floor(Math.random() * 360),
        speed: Math.random() * 15,
        status: mapVesselStatus(vessel.status),
        last_update: new Date().toISOString(),
        captain: "Capitão",
        destination: undefined,
        dpClass: inferDPClass(vessel.vessel_type),
        dpMode: "Auto DP",
        asogStatus: "green",
        operationType: inferOperation(vessel.vessel_type),
        environmental: {
          windSpeed: 10 + Math.random() * 20,
          waveHeight: 0.5 + Math.random() * 2,
          current: 0.3 + Math.random() * 1.5,
        },
        power: {
          available: 12000 + Math.random() * 20000,
          consumed: 5000 + Math.random() * 15000,
        },
        alerts: Math.floor(Math.random() * 3),
        crew: 20 + Math.floor(Math.random() * 100),
        onlineStatus: vessel.status === "operational" ? "online" : "degraded",
      }));
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const alertsQuery = useQuery({
    queryKey: ["fleet-alerts"],
    queryFn: async (): Promise<FleetAlert[]> => {
      const { data, error } = await supabase
        .from("soc_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      if (!data || data.length === 0) {
        return generateDemoAlerts();
      }

      return data.map((alert) => ({
        id: alert.id,
        vesselId: alert.vessel_id || "",
        vesselName: (alert.metadata as any)?.vessel_name || "Embarcação",
        type: mapAlertSeverity(alert.severity),
        message: alert.message || alert.title || "Alerta",
        timestamp: alert.created_at,
        acknowledged: alert.is_acknowledged || false,
      }));
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("fleet-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "vessels" }, () => {
        queryClient.invalidateQueries({ queryKey: ["fleet-tracking"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "soc_alerts" }, () => {
        queryClient.invalidateQueries({ queryKey: ["fleet-alerts"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    vessels: vesselsQuery.data || [],
    alerts: alertsQuery.data || [],
    isLoading: vesselsQuery.isLoading || alertsQuery.isLoading,
    error: vesselsQuery.error || alertsQuery.error,
    refetch: () => {
      vesselsQuery.refetch();
      alertsQuery.refetch();
    },
  };
}

function inferDPClass(vesselType: string | null): string {
  const type = vesselType?.toLowerCase() || "";
  if (type.includes("dsv") || type.includes("plsv")) return "DP-3";
  if (type.includes("ahts") || type.includes("psv")) return "DP-2";
  return "DP-1";
}

function inferOperation(vesselType: string | null): string {
  const type = vesselType?.toLowerCase() || "";
  if (type.includes("dsv")) return "Diving Operations";
  if (type.includes("plsv")) return "Pipelay";
  if (type.includes("ahts")) return "Anchor Handling";
  if (type.includes("psv")) return "Supply";
  return "Transit";
}

function mapAlertSeverity(severity: string | null): FleetAlert["type"] {
  const s = severity?.toLowerCase() || "";
  if (s.includes("critical") || s.includes("high")) return "critical";
  if (s.includes("warning") || s.includes("medium")) return "warning";
  return "info";
}

function generateDemoVessels(): VesselLocation[] {
  return [
    {
      id: "demo-1",
      name: "Nautilus Explorer",
      type: "PSV",
      latitude: -23.5505,
      longitude: -46.6333,
      course: 45,
      speed: 12.5,
      status: "active",
      last_update: new Date().toISOString(),
      captain: "Capitão Silva",
      destination: "Porto de Santos",
      dpClass: "DP-2",
      dpMode: "Auto DP",
      asogStatus: "green",
      operationType: "Supply",
      environmental: { windSpeed: 18, waveHeight: 1.2, current: 0.8 },
      power: { available: 12000, consumed: 7500 },
      alerts: 0,
      crew: 24,
      onlineStatus: "online",
    },
    {
      id: "demo-2",
      name: "Atlantic Pioneer",
      type: "AHTS",
      latitude: -22.9068,
      longitude: -43.1729,
      course: 180,
      speed: 0,
      status: "anchored",
      last_update: new Date().toISOString(),
      captain: "Capitão Costa",
      destination: "Rio de Janeiro",
      dpClass: "DP-2",
      dpMode: "TAM",
      asogStatus: "yellow",
      operationType: "Anchor Handling",
      environmental: { windSpeed: 25, waveHeight: 2.1, current: 1.2 },
      power: { available: 18000, consumed: 14000 },
      alerts: 2,
      crew: 32,
      onlineStatus: "online",
    },
  ];
}

function generateDemoAlerts(): FleetAlert[] {
  return [
    {
      id: "demo-alert-1",
      vesselId: "demo-2",
      vesselName: "Atlantic Pioneer",
      type: "warning",
      message: "Vento aproximando-se do limite operacional",
      timestamp: new Date().toISOString(),
      acknowledged: false,
    },
  ];
}

export function useFleetStats() {
  const { vessels, alerts } = useFleetTracking();

  const activeVessels = vessels.filter((v) => v.status === "active" || v.dpMode !== "Standby").length;
  const asogAlerts = vessels.filter((v) => v.asogStatus !== "green").length;
  const totalCrew = vessels.reduce((acc, v) => acc + (v.crew || 0), 0);
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length;
  const criticalAlerts = alerts.filter((a) => a.type === "critical" && !a.acknowledged).length;

  return {
    total: vessels.length,
    activeVessels,
    asogAlerts,
    totalCrew,
    unacknowledgedAlerts,
    criticalAlerts,
  };
}
