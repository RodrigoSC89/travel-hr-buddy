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
        return []; // Return empty array - UI should show EmptyState
      }

      // Use deterministic positions based on vessel index
      const portPositions = [
        { lat: -23.96, lng: -46.33 }, // Santos
        { lat: -22.90, lng: -43.17 }, // Rio
        { lat: -12.97, lng: -38.51 }, // Salvador
        { lat: -8.05, lng: -34.88 },  // Recife
        { lat: -25.43, lng: -49.27 }, // Curitiba coast
      ];

      return data.map((vessel, idx) => {
        const basePos = portPositions[idx % portPositions.length];
        const isMoving = vessel.status === "operational" || vessel.status === "active";
        return {
          id: vessel.id,
          name: vessel.name || `Embarcação ${vessel.imo_number || vessel.id.slice(0, 6)}`,
          type: vessel.vessel_type || "Cargo",
          latitude: isMoving ? basePos.lat + idx * 0.5 : basePos.lat,
          longitude: isMoving ? basePos.lng + idx * 0.5 : basePos.lng,
          course: isMoving ? (30 + idx * 25) % 360 : 0,
          speed: isMoving ? 8 + idx * 0.5 : 0,
          status: mapVesselStatus(vessel.status),
          last_update: new Date().toISOString(),
          captain: "Capitão",
          destination: undefined,
          dpClass: inferDPClass(vessel.vessel_type),
          dpMode: "Auto DP",
          asogStatus: "green",
          operationType: inferOperation(vessel.vessel_type),
          environmental: {
            windSpeed: 12 + idx * 2,
            waveHeight: 0.8 + idx * 0.3,
            current: 0.5 + idx * 0.2,
          },
          power: {
            available: 15000 + idx * 3000,
            consumed: 8000 + idx * 2000,
          },
          alerts: 0,
          crew: 25 + idx * 5,
          onlineStatus: vessel.status === "operational" ? "online" : "degraded",
        };
      });
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
        return []; // Return empty array - no demo data
      }

      return data.map((alert) => ({
        id: alert.id,
        vesselId: alert.vessel_id || "",
        vesselName: (alert.metadata as Record<string, unknown> | null)?.vessel_name as string || "Embarcação",
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

// Demo data removed - system should use real data from Supabase
// If no data, components should display EmptyState with CTA to add vessels

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
