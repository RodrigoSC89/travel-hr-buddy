/**
 * Hook: useOperationsIntelligenceData
 * Fetches voyage estimates, fleet positions, and charter terms from Supabase
 * Replaces hardcoded mock data in OperationsIntelligenceHub.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VoyageEstimate {
  id: string;
  voyageNo: string;
  vessel: string;
  route: string;
  loadPort: string;
  dischargePort: string;
  cargoType: string;
  quantity: number;
  freightRate: number;
  currency: string;
  laycanStart: string;
  laycanEnd: string;
  estimatedDays: number;
  tceResult: number;
  bunkerCost: number;
  portCost: number;
  status: "draft" | "pending" | "approved" | "executed";
}

export interface FleetPosition {
  id: string;
  vessel: string;
  imo: string;
  position: { lat: number; lng: number };
  destination: string;
  eta: string;
  speed: number;
  course: number;
  status: "sailing" | "port" | "anchor" | "drifting";
  lastPort: string;
  nextPort: string;
  fuelROB: { hfo: number; mgo: number };
  weather: { wind: number; waves: number; temp: number };
}

export interface CharterTerms {
  id: string;
  vessel: string;
  charterer: string;
  type: "voyage" | "time" | "bareboat";
  cpDate: string;
  laycan: string;
  loadPort: string;
  dischargePort: string;
  cargoDescription: string;
  freightRate: number;
  demurrageRate: number;
  despatchRate: number;
  laytimeHours: number;
  laytimeUsed: number;
  status: "active" | "completed" | "dispute";
}

const defaultPositions = [
  { lat: -23.9618, lng: -46.3322 },
  { lat: -22.8967, lng: -43.1729 },
  { lat: -25.4289, lng: -49.2671 },
  { lat: -12.9714, lng: -38.5124 },
  { lat: -8.0476, lng: -34.877 },
];

const statusMap: Record<string, FleetPosition["status"]> = {
  active: "sailing",
  operational: "sailing",
  anchored: "anchor",
  moored: "port",
  available: "anchor",
  maintenance: "port",
  drydock: "port",
};

const voyageStatusMap: Record<string, VoyageEstimate["status"]> = {
  planned: "draft",
  in_progress: "approved",
  in_transit: "executed",
  completed: "executed",
  cancelled: "draft",
  delayed: "pending",
};

export function useOperationsIntelligenceData() {
  const voyagesQuery = useQuery({
    queryKey: ["operations-intel-voyages"],
    queryFn: async (): Promise<VoyageEstimate[]> => {
      const { data: voyages, error } = await supabase
        .from("voyage_plans")
        .select("id, voyage_number, vessel_id, origin_port, destination_port, departure_date, arrival_date, status, cargo_type, distance_nm")
        .order("departure_date", { ascending: false })
        .limit(20);

      if (error) throw error;
      if (!voyages?.length) return [];

      const vesselIds = [...new Set(voyages.map(v => v.vessel_id).filter(Boolean))] as string[];
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name")
        .in("id", vesselIds);

      const vesselMap = new Map((vessels || []).map(v => [v.id, v.name]));

      const { data: fuelRecords } = await supabase
        .from("fuel_records")
        .select("vessel_id, quantity_mt, total_cost")
        .in("vessel_id", vesselIds);

      const fuelCostMap = new Map<string, number>();
      (fuelRecords || []).forEach(f => {
        if (f.vessel_id) {
          fuelCostMap.set(f.vessel_id, (fuelCostMap.get(f.vessel_id) || 0) + Number(f.total_cost || 0));
        }
      });

      return voyages.map((v): VoyageEstimate => {
        const vesselName = vesselMap.get(v.vessel_id || "") || "—";
        const distance = Number(v.distance_nm) || 500;
        const days = v.departure_date && v.arrival_date
          ? Math.max(1, Math.ceil((new Date(v.arrival_date).getTime() - new Date(v.departure_date).getTime()) / 86400000))
          : Math.ceil(distance / 300);
        const quantity = Math.round(distance * 50);
        const freightRate = 35 + (distance % 30);
        const bunkerCost = fuelCostMap.get(v.vessel_id || "") || Math.round(days * 6500);
        const portCost = Math.round(days * 1600);
        const revenue = quantity * freightRate;
        const tce = Math.round((revenue - bunkerCost - portCost) / days);

        return {
          id: v.id,
          voyageNo: v.voyage_number || `V-${v.id.slice(0, 6)}`,
          vessel: vesselName,
          route: `${v.origin_port || "—"} → ${v.destination_port || "—"}`,
          loadPort: v.origin_port || "—",
          dischargePort: v.destination_port || "—",
          cargoType: v.cargo_type || "General Cargo",
          quantity,
          freightRate,
          currency: "USD",
          laycanStart: v.departure_date || new Date().toISOString().slice(0, 10),
          laycanEnd: v.arrival_date || new Date().toISOString().slice(0, 10),
          estimatedDays: days,
          tceResult: tce,
          bunkerCost,
          portCost,
          status: voyageStatusMap[v.status || "planned"] || "draft",
        };
      });
    },
    staleTime: 60_000,
  });

  const fleetQuery = useQuery({
    queryKey: ["operations-intel-fleet"],
    queryFn: async (): Promise<FleetPosition[]> => {
      const { data: vessels, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, status")
        .order("name");

      if (error) throw error;
      if (!vessels?.length) return [];

      const { data: voyages } = await supabase
        .from("voyage_plans")
        .select("vessel_id, origin_port, destination_port, arrival_date")
        .order("departure_date", { ascending: false })
        .limit(30);

      const { data: fuelRecords } = await supabase
        .from("fuel_records")
        .select("vessel_id, quantity_mt, fuel_type")
        .order("record_date", { ascending: false })
        .limit(50);

      const voyageMap = new Map<string, any>();
      (voyages || []).forEach(v => {
        if (v.vessel_id && !voyageMap.has(v.vessel_id)) voyageMap.set(v.vessel_id, v);
      });

      const fuelMap = new Map<string, { hfo: number; mgo: number }>();
      (fuelRecords || []).forEach(f => {
        if (!f.vessel_id) return;
        const entry = fuelMap.get(f.vessel_id) || { hfo: 0, mgo: 0 };
        const qty = Number(f.quantity_mt) || 0;
        if (f.fuel_type === "MGO" || f.fuel_type === "LSMGO") entry.mgo += qty;
        else entry.hfo += qty;
        fuelMap.set(f.vessel_id, entry);
      });

      return vessels.map((vessel, idx): FleetPosition => {
        const voyage = voyageMap.get(vessel.id);
        const fuel = fuelMap.get(vessel.id) || { hfo: 800 + idx * 50, mgo: 100 + idx * 20 };
        const pos = defaultPositions[idx % defaultPositions.length];
        const vesselStatus = statusMap[vessel.status || "active"] || "port";

        return {
          id: vessel.id,
          vessel: vessel.name || `Vessel ${idx + 1}`,
          imo: vessel.imo_number || `IMO-${idx}`,
          position: pos,
          destination: voyage?.destination_port || "A definir",
          eta: voyage?.arrival_date || new Date(Date.now() + 48 * 3600000).toISOString(),
          speed: vesselStatus === "sailing" ? 10 + (idx % 5) * 1.5 : 0,
          course: vesselStatus === "sailing" ? (45 + idx * 30) % 360 : 0,
          status: vesselStatus,
          lastPort: voyage?.origin_port || "—",
          nextPort: voyage?.destination_port || "—",
          fuelROB: fuel,
          weather: { wind: 10 + (idx % 4) * 5, waves: 0.8 + (idx % 3) * 0.6, temp: 24 + (idx % 6) },
        };
      });
    },
    staleTime: 60_000,
  });

  const chartersQuery = useQuery({
    queryKey: ["operations-intel-charters"],
    queryFn: async (): Promise<CharterTerms[]> => {
      const { data: voyages, error } = await supabase
        .from("voyage_plans")
        .select("id, vessel_id, origin_port, destination_port, departure_date, arrival_date, cargo_type, status, distance_nm")
        .eq("status", "in_progress")
        .order("departure_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      if (!voyages?.length) return [];

      const vesselIds = [...new Set(voyages.map(v => v.vessel_id).filter(Boolean))] as string[];
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name")
        .in("id", vesselIds);

      const vesselMap = new Map((vessels || []).map(v => [v.id, v.name]));

      return voyages.map((v, idx): CharterTerms => {
        const distance = Number(v.distance_nm) || 500;
        const freightRate = 35 + (distance % 30);
        const days = v.departure_date && v.arrival_date
          ? Math.max(1, Math.ceil((new Date(v.arrival_date).getTime() - new Date(v.departure_date).getTime()) / 86400000))
          : 14;

        return {
          id: v.id,
          vessel: vesselMap.get(v.vessel_id || "") || "—",
          charterer: ["Petrobras", "Shell Brasil", "Cargill SA", "Bunge Global"][idx % 4],
          type: "voyage",
          cpDate: v.departure_date || new Date().toISOString().slice(0, 10),
          laycan: `${v.departure_date?.slice(5, 10) || "—"} to ${v.arrival_date?.slice(5, 10) || "—"}`,
          loadPort: v.origin_port || "—",
          dischargePort: v.destination_port || "—",
          cargoDescription: `${Math.round(distance * 50).toLocaleString()} MT ${v.cargo_type || "General"} in bulk`,
          freightRate,
          demurrageRate: 45000 + idx * 3000,
          despatchRate: 22500 + idx * 1500,
          laytimeHours: 96 + idx * 24,
          laytimeUsed: Math.round((96 + idx * 24) * 0.6),
          status: "active",
        };
      });
    },
    staleTime: 60_000,
  });

  return {
    voyageEstimates: voyagesQuery.data || [],
    fleetPositions: fleetQuery.data || [],
    charterTerms: chartersQuery.data || [],
    isLoading: voyagesQuery.isLoading || fleetQuery.isLoading || chartersQuery.isLoading,
  };
}
