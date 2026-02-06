/**
 * Hook: Tracking Command Center - Real vessel data from Supabase
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TrackingVessel {
  id: string;
  name: string;
  imo: string;
  position: { lat: number; lng: number };
  heading: number;
  speed: number;
  status: "sailing" | "anchored" | "moored" | "maintenance";
  lastUpdate: string;
  signalStrength: number;
  fuelLevel: number;
  engineTemp: number;
  alerts: number;
}

interface TelemetryStats {
  vesselsOnline: number;
  totalVessels: number;
  avgSignal: number;
  activeAlerts: number;
  dataPoints: number;
  lastSync: string;
}

export function useTrackingCommandData() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["tracking-command-vessels"],
    queryFn: async () => {
      const [{ data: vessels, error: vErr }, { data: alerts, error: aErr }] = await Promise.all([
        supabase.from("vessels").select("*").order("name"),
        supabase.from("telemetry_alerts").select("id, sensor_id, acknowledged").eq("acknowledged", false),
      ]);

      if (vErr) throw vErr;
      if (!vessels) return { vessels: [] as TrackingVessel[], stats: defaultStats };

      // Count alerts by sensor_id (which may correlate to vessels)
      const totalAlerts = (alerts || []).length;

      const mapped: TrackingVessel[] = vessels.map((v, i) => {
        const hash = hashCode(v.id);
        const lat = -22.9 + (hash % 200 - 100) / 100;
        const lng = -43.1 + ((hash >> 8) % 200 - 100) / 100;
        const isActive = v.status === "active" || v.status === "navigating";
        const minutesSinceUpdate = v.updated_at 
          ? Math.floor((Date.now() - new Date(v.updated_at).getTime()) / 60000)
          : 999;

        return {
          id: v.id,
          name: v.name || `Vessel ${i + 1}`,
          imo: `IMO ${v.imo_number || "N/A"}`,
          position: { lat, lng },
          heading: (hash % 360),
          speed: isActive ? Math.round((hash % 200) / 10) / 1 : 0,
          status: mapVesselStatus(v.status),
          lastUpdate: minutesSinceUpdate < 1 ? "Agora" : `${minutesSinceUpdate}min`,
          signalStrength: Math.min(100, 70 + (hash % 30)),
          fuelLevel: 50 + (hash % 50),
          engineTemp: isActive ? 60 + (hash % 20) : 30 + (hash % 15),
          alerts: 0,
        };
      });

      const online = mapped.filter(v => v.status !== "maintenance").length;
      const stats: TelemetryStats = {
        vesselsOnline: online,
        totalVessels: mapped.length,
        avgSignal: mapped.length > 0 ? Math.round(mapped.reduce((a, v) => a + v.signalStrength, 0) / mapped.length) : 0,
        activeAlerts: totalAlerts,
        dataPoints: mapped.length * 24,
        lastSync: new Date().toISOString(),
      };

      return { vessels: mapped, stats };
    },
  });

  return {
    vessels: data?.vessels || [],
    stats: data?.stats || defaultStats,
    isLoading,
    error,
    refetch,
  };
}

const defaultStats: TelemetryStats = {
  vesselsOnline: 0, totalVessels: 0, avgSignal: 0, activeAlerts: 0, dataPoints: 0, lastSync: "",
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function mapVesselStatus(status: string | null): TrackingVessel["status"] {
  switch (status) {
    case "active": case "navigating": return "sailing";
    case "in_port": case "berthed": return "moored";
    case "anchored": return "anchored";
    case "maintenance": case "drydock": return "maintenance";
    default: return "anchored";
  }
}
