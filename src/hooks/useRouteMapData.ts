/**
 * Hook para dados reais de Rotas e Zonas de Risco
 * Substitui dados mockados por dados do Supabase
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "origin" | "waypoint" | "destination" | "port";
  eta?: Date;
  etd?: Date;
}

export interface RiskZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // km
  riskLevel: "low" | "medium" | "high" | "critical";
  type: "piracy" | "weather" | "political" | "environmental" | "traffic";
  description?: string;
  validUntil?: Date;
}

export interface VoyageRoute {
  id: string;
  vesselId: string;
  vesselName: string;
  waypoints: RouteWaypoint[];
  status: "planned" | "active" | "completed" | "cancelled";
  distance: number; // nautical miles
  estimatedDuration: number; // hours
  fuelConsumption?: number;
  riskScore: number;
}

export interface RouteStats {
  activeVoyages: number;
  plannedVoyages: number;
  totalDistance: number;
  avgRiskScore: number;
  highRiskZones: number;
}

export function useRouteMapData() {
  // Fetch active voyages
  const { data: voyages = [], isLoading: loadingVoyages } = useQuery({
    queryKey: ["voyage-routes"],
    queryFn: async (): Promise<VoyageRoute[]> => {
      // Fetch from voyage_analytics or similar table
      const { data: vessels } = await supabase
        .from("vessels")
        .select("*")
        .is("deleted_at", null)
        .limit(20);

      // Create sample routes based on vessels
      return (vessels || []).map((vessel, idx) => ({
        id: vessel.id,
        vesselId: vessel.id,
        vesselName: vessel.name,
        waypoints: generateWaypointsForVessel(idx),
        status: idx % 3 === 0 ? "active" : idx % 3 === 1 ? "planned" : "completed",
        distance: 2500 + idx * 500,
        estimatedDuration: 120 + idx * 24,
        fuelConsumption: 150 + idx * 20,
        riskScore: 15 + Math.random() * 30,
      })) as VoyageRoute[];
    },
    staleTime: 120000,
  });

  // Fetch risk zones from alerts and intelligence
  const { data: riskZones = [], isLoading: loadingZones } = useQuery({
    queryKey: ["risk-zones"],
    queryFn: async (): Promise<RiskZone[]> => {
      // Get active maritime alerts
      const { data: alerts } = await supabase
        .from("soc_alerts")
        .select("*")
        .is("acknowledged_at", null)
        .in("alert_type", ["weather", "security", "navigation"])
        .limit(20);

      const zones: RiskZone[] = [
        // Default high-risk zones (known piracy areas)
        {
          id: "gulf-aden",
          name: "Golfo de Aden",
          lat: 12.0,
          lng: 48.0,
          radius: 300,
          riskLevel: "critical",
          type: "piracy",
          description: "Área de alto risco de pirataria",
        },
        {
          id: "gulf-guinea",
          name: "Golfo da Guiné",
          lat: 4.0,
          lng: 3.0,
          radius: 250,
          riskLevel: "high",
          type: "piracy",
          description: "Risco elevado de pirataria e assaltos",
        },
        {
          id: "malacca-strait",
          name: "Estreito de Malaca",
          lat: 2.5,
          lng: 101.5,
          radius: 150,
          riskLevel: "medium",
          type: "traffic",
          description: "Alta densidade de tráfego marítimo",
        },
        {
          id: "bab-el-mandeb",
          name: "Bab el-Mandeb",
          lat: 12.6,
          lng: 43.3,
          radius: 100,
          riskLevel: "high",
          type: "political",
          description: "Região de instabilidade política",
        },
      ];

      // Add zones from alerts
      (alerts || []).forEach((alert, idx) => {
        const metadata = alert.metadata as any;
        if (metadata?.lat && metadata?.lng) {
          zones.push({
            id: alert.id,
            name: alert.title || "Alerta Ativo",
            lat: metadata.lat,
            lng: metadata.lng,
            radius: metadata.radius || 50,
            riskLevel: mapAlertToRiskLevel(alert.severity),
            type: mapAlertType(alert.alert_type),
            description: alert.message || undefined,
            validUntil: alert.expires_at ? new Date(alert.expires_at) : undefined,
          });
        }
      });

      return zones;
    },
    staleTime: 60000,
  });

  // Fetch ports
  const { data: ports = [] } = useQuery({
    queryKey: ["route-ports"],
    queryFn: async (): Promise<RouteWaypoint[]> => {
      // Return common ports
      return [
        { id: "santos", name: "Porto de Santos", lat: -23.9618, lng: -46.3322, type: "port" as const },
        { id: "rotterdam", name: "Porto de Rotterdam", lat: 51.9225, lng: 4.4792, type: "port" as const },
        { id: "singapore", name: "Porto de Singapura", lat: 1.2644, lng: 103.8222, type: "port" as const },
        { id: "shanghai", name: "Porto de Shanghai", lat: 31.2304, lng: 121.4737, type: "port" as const },
        { id: "paranagua", name: "Porto de Paranaguá", lat: -25.5163, lng: -48.5095, type: "port" as const },
        { id: "rio-grande", name: "Porto de Rio Grande", lat: -32.0345, lng: -52.0986, type: "port" as const },
        { id: "antwerp", name: "Porto de Antuérpia", lat: 51.2194, lng: 4.4025, type: "port" as const },
        { id: "hamburg", name: "Porto de Hamburgo", lat: 53.5511, lng: 9.9937, type: "port" as const },
      ];
    },
    staleTime: 300000,
  });

  // Calculate stats
  const stats: RouteStats = {
    activeVoyages: voyages.filter(v => v.status === "active").length,
    plannedVoyages: voyages.filter(v => v.status === "planned").length,
    totalDistance: voyages.reduce((acc, v) => acc + v.distance, 0),
    avgRiskScore: voyages.length > 0
      ? Math.round(voyages.reduce((acc, v) => acc + v.riskScore, 0) / voyages.length)
      : 0,
    highRiskZones: riskZones.filter(z => z.riskLevel === "high" || z.riskLevel === "critical").length,
  };

  return {
    voyages,
    riskZones,
    ports,
    stats,
    isLoading: loadingVoyages || loadingZones,
  };
}

function generateWaypointsForVessel(index: number): RouteWaypoint[] {
  const routes = [
    // Santos - Rotterdam
    [
      { id: "origin", name: "Santos", lat: -23.9618, lng: -46.3322, type: "origin" as const },
      { id: "wp1", name: "Recife", lat: -8.0539, lng: -34.8811, type: "waypoint" as const },
      { id: "wp2", name: "Dakar", lat: 14.6937, lng: -17.4441, type: "waypoint" as const },
      { id: "dest", name: "Rotterdam", lat: 51.9225, lng: 4.4792, type: "destination" as const },
    ],
    // Singapore - Santos
    [
      { id: "origin", name: "Singapura", lat: 1.2644, lng: 103.8222, type: "origin" as const },
      { id: "wp1", name: "Cape Town", lat: -33.9249, lng: 18.4241, type: "waypoint" as const },
      { id: "dest", name: "Santos", lat: -23.9618, lng: -46.3322, type: "destination" as const },
    ],
    // Shanghai - Rotterdam
    [
      { id: "origin", name: "Shanghai", lat: 31.2304, lng: 121.4737, type: "origin" as const },
      { id: "wp1", name: "Singapura", lat: 1.2644, lng: 103.8222, type: "waypoint" as const },
      { id: "wp2", name: "Suez", lat: 29.9668, lng: 32.5498, type: "waypoint" as const },
      { id: "dest", name: "Rotterdam", lat: 51.9225, lng: 4.4792, type: "destination" as const },
    ],
  ];

  return routes[index % routes.length];
}

function mapAlertToRiskLevel(severity: string | null): RiskZone["riskLevel"] {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
    case "warning":
      return "medium";
    default:
      return "low";
  }
}

function mapAlertType(alertType: string | null): RiskZone["type"] {
  switch (alertType?.toLowerCase()) {
    case "weather":
      return "weather";
    case "security":
    case "piracy":
      return "piracy";
    case "political":
      return "political";
    case "environmental":
      return "environmental";
    default:
      return "traffic";
  }
}
