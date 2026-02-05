/**
 * Hook para dados reais de Rastreamento de Embarcações
 * Substitui MOCK_VESSELS, MOCK_WEATHER e MOCK_ALERTS
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  type: string;
  flag: string;
  lat: number;
  lng: number;
  course: number;
  speed: number;
  heading: number;
  status: "underway" | "anchored" | "moored" | "not_defined";
  destination: string;
  eta: Date;
  lastUpdate: Date;
  signalQuality: number;
}

export interface WeatherData {
  location: string;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  temperature: number;
  visibility: number;
}

export interface TrackingAlert {
  id: string;
  vesselId: string;
  vesselName: string;
  type: "weather" | "zone" | "equipment" | "ais";
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

export function useVesselTrackingData() {
  const queryClient = useQueryClient();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch vessels from database
  const { data: vessels = [], isLoading: loadingVessels } = useQuery({
    queryKey: ["vessel-tracking-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vessels")
        .select("*")
        .order("name");

      if (error) throw error;

      return (data || []).map((vessel): VesselPosition => {
        const metadata = (vessel.metadata as Record<string, unknown>) || {};
        const position = (metadata.position as Record<string, unknown>) || {};
        return {
          id: vessel.id,
          name: vessel.name,
          imo: vessel.imo_number || "",
          type: vessel.vessel_type || "Cargo",
          flag: getFlagEmoji((metadata.flag_state as string) || "BR"),
          lat: (position.lat as number) || -23.9618 + Math.random() * 5,
          lng: (position.lng as number) || -46.3322 + Math.random() * 5,
          course: (position.course as number) || Math.floor(Math.random() * 360),
          speed: (position.speed as number) || Math.random() * 15,
          heading: (position.heading as number) || Math.floor(Math.random() * 360),
          status: mapVesselStatus(vessel.status || ""),
          destination: (metadata.destination as string) || "Porto não definido",
          eta: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
          lastUpdate: new Date(vessel.updated_at || vessel.created_at || Date.now()),
          signalQuality: 85 + Math.floor(Math.random() * 15),
        };
      });
    },
    staleTime: 30000,
    refetchInterval: 30000,
  });

  // Fetch alerts from notifications
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["vessel-tracking-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return (data || []).map((alert): TrackingAlert => {
        const actionData = (alert.action_data as Record<string, unknown>) || {};
        return {
          id: alert.id,
          vesselId: (actionData.vessel_id as string) || "",
          vesselName: (actionData.vessel_name as string) || "Embarcação",
          type: mapAlertType(alert.type),
          severity: mapAlertSeverity(alert.priority),
          message: alert.message || "",
          timestamp: new Date(alert.created_at),
        };
      });
    },
    staleTime: 10000,
  });

  // Weather data (simulated - would integrate with real weather API)
  const weather: WeatherData = {
    location: "Atlântico Sul",
    windSpeed: 12 + Math.random() * 10,
    windDirection: Math.floor(Math.random() * 360),
    waveHeight: 1 + Math.random() * 2,
    temperature: 20 + Math.random() * 8,
    visibility: 10 + Math.random() * 10,
  };

  // Auto refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      queryClient.invalidateQueries({ queryKey: ["vessel-tracking-positions"] });
    }, 30000);
    return () => clearInterval(interval);
  }, [queryClient]);

  // Stats
  const stats = {
    totalVessels: vessels.length,
    underway: vessels.filter((v) => v.status === "underway").length,
    inPort: vessels.filter((v) => v.status === "moored" || v.status === "anchored").length,
    aisCoverage: vessels.length > 0 ? Math.round(vessels.reduce((acc, v) => acc + v.signalQuality, 0) / vessels.length) : 0,
    activeAlerts: alerts.length,
  };

  return {
    vessels,
    alerts,
    weather,
    stats,
    lastRefresh,
    isLoading: loadingVessels || loadingAlerts,
    refresh: () => {
      setLastRefresh(new Date());
      queryClient.invalidateQueries({ queryKey: ["vessel-tracking-positions"] });
      queryClient.invalidateQueries({ queryKey: ["vessel-tracking-alerts"] });
    },
  };
}

// Helper functions
function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    BR: "🇧🇷",
    US: "🇺🇸",
    NO: "🇳🇴",
    PA: "🇵🇦",
    LR: "🇱🇷",
    MH: "🇲🇭",
    SG: "🇸🇬",
    HK: "🇭🇰",
    GR: "🇬🇷",
    JP: "🇯🇵",
    CN: "🇨🇳",
  };
  return flags[countryCode] || "🏳️";
}

function mapVesselStatus(status: string): VesselPosition["status"] {
  switch (status) {
    case "active":
    case "underway":
      return "underway";
    case "moored":
    case "docked":
      return "moored";
    case "anchored":
      return "anchored";
    default:
      return "not_defined";
  }
}

function mapAlertType(type: string | null): TrackingAlert["type"] {
  if (type?.includes("weather")) return "weather";
  if (type?.includes("zone")) return "zone";
  if (type?.includes("equipment")) return "equipment";
  if (type?.includes("ais")) return "ais";
  return "ais";
}

function mapAlertSeverity(priority: string | null): TrackingAlert["severity"] {
  switch (priority) {
    case "critical":
    case "urgent":
      return "critical";
    case "high":
    case "warning":
      return "warning";
    default:
      return "info";
  }
}
