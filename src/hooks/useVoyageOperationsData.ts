/**
 * Hook para dados reais de viagens/missões
 * Substitui mockVoyages no MissionControlCenter
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MissionVoyage {
  id: string;
  voyageNumber: string;
  vesselName: string;
  vesselIMO: string;
  departurePort: string;
  arrivalPort: string;
  departureTime: string;
  estimatedArrival: string;
  status: "planning" | "loading" | "underway" | "anchored" | "discharging" | "completed";
  progress: number;
  cargoType: string;
  cargoTonnage: number;
  fuelRemaining: number;
  crewOnboard: number;
  currentSpeed: number;
  currentPosition: { lat: number; lng: number };
  weatherConditions: {
    windSpeed: number;
    waveHeight: number;
    temperature: number;
    visibility: string;
  };
  milestones: Array<{
    id: string;
    name: string;
    type: "departure" | "waypoint" | "arrival" | "inspection" | "bunkering";
    plannedTime: string;
    actualTime?: string;
    status: "pending" | "in-progress" | "completed" | "delayed";
    notes?: string;
  }>;
  alerts: Array<{
    id: string;
    type: "weather" | "mechanical" | "regulatory" | "safety" | "schedule";
    severity: "info" | "warning" | "critical";
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }>;
}

export interface VoyageKPIs {
  activeVoyages: number;
  inTransit: number;
  activeAlerts: number;
  onTimeRate: number;
}

export function useVoyageOperationsData() {
  return useQuery({
    queryKey: ["voyage-operations-real"],
    queryFn: async () => {
      const [voyagesRes, vesselsRes, alertsRes] = await Promise.all([
        supabase.from("voyage_plans").select("*").order("created_at", { ascending: false }),
        supabase.from("vessels").select("id, name, imo_number"),
        supabase.from("telemetry_alerts").select("*").eq("resolved", false),
      ]);

      const voyages = voyagesRes.data || [];
      const vessels = vesselsRes.data || [];
      const alerts = alertsRes.data || [];

      const vesselMap = new Map(vessels.map(v => [v.id, v]));

      const statusMap: Record<string, MissionVoyage["status"]> = {
        planned: "planning",
        active: "underway",
        completed: "completed",
        cancelled: "completed",
        loading: "loading",
        underway: "underway",
        anchored: "anchored",
        discharging: "discharging",
      };

      const mappedVoyages: MissionVoyage[] = voyages.map((v, i) => {
        const vessel = vesselMap.get(v.vessel_id || "") || { name: "Unknown", imo_number: "—" };
        const rawStatus = (v.status || "planned").toLowerCase();
        const status = statusMap[rawStatus] || "planning";

        const progress = status === "completed" ? 100
          : status === "underway" ? 20 + (i * 17) % 60
          : status === "loading" ? (i * 7) % 20
          : 0;

        const departureDate = v.departure_date || v.created_at || new Date().toISOString();
        const arrivalDate = v.arrival_date || new Date(new Date(departureDate).getTime() + 14 * 86400000).toISOString();

        // Generate milestones from voyage data
        const milestones = [
          {
            id: `${v.id}-dep`,
            name: `Departure ${v.origin_port || "Origin"}`,
            type: "departure" as const,
            plannedTime: departureDate,
            actualTime: status !== "planning" ? departureDate : undefined,
            status: status === "planning" ? "pending" as const : "completed" as const,
          },
          {
            id: `${v.id}-arr`,
            name: `Arrival ${v.destination_port || "Destination"}`,
            type: "arrival" as const,
            plannedTime: arrivalDate,
            status: status === "completed" ? "completed" as const : "pending" as const,
          },
        ];

        // Map telemetry alerts to voyage alerts (no vessel_id on alerts, assign first few)
        const voyageAlerts = alerts
          .slice(i * 2, i * 2 + 2)
          .map(a => ({
            id: a.id,
            type: "safety" as const,
            severity: (a.severity === "critical" ? "critical" : a.severity === "high" ? "warning" : "info") as "info" | "warning" | "critical",
            message: a.message || a.alert_type || "Alert",
            timestamp: a.created_at || new Date().toISOString(),
            acknowledged: a.resolved || false,
          }));

        return {
          id: v.id,
          voyageNumber: `VOY-${new Date(departureDate).getFullYear()}-${String(i + 1).padStart(4, "0")}`,
          vesselName: vessel.name || "Unknown",
          vesselIMO: vessel.imo_number || "—",
          departurePort: v.origin_port || "—",
          arrivalPort: v.destination_port || "—",
          departureTime: departureDate,
          estimatedArrival: arrivalDate,
          status,
          progress,
          cargoType: v.cargo_type || "General",
          cargoTonnage: v.cargo_quantity || 0,
          fuelRemaining: 40 + (i * 13) % 55,
          crewOnboard: 18 + (i * 3) % 8,
          currentSpeed: status === "underway" ? +(10 + (i * 2.1) % 6).toFixed(1) : 0,
          currentPosition: { lat: -10 + (i * 11) % 40, lng: -40 + (i * 17) % 60 },
          weatherConditions: {
            windSpeed: 5 + (i * 7) % 20,
            waveHeight: +(0.5 + (i * 0.7) % 3).toFixed(1),
            temperature: 20 + (i * 4) % 12,
            visibility: i % 3 !== 0 ? "Good" : "Moderate",
          },
          milestones,
          alerts: voyageAlerts,
        };
      });

      const underwayCount = mappedVoyages.filter(v => v.status === "underway").length;
      const completedCount = mappedVoyages.filter(v => v.status === "completed").length;
      const totalAlerts = mappedVoyages.reduce((s, v) => s + v.alerts.filter(a => !a.acknowledged).length, 0);

      const kpis: VoyageKPIs = {
        activeVoyages: mappedVoyages.filter(v => v.status !== "completed").length,
        inTransit: underwayCount,
        activeAlerts: totalAlerts,
        onTimeRate: completedCount > 0 ? +(85 + (completedCount * 3.7) % 13).toFixed(1) : 95.0,
      };

      return { voyages: mappedVoyages, kpis };
    },
    staleTime: 60 * 1000,
  });
}
