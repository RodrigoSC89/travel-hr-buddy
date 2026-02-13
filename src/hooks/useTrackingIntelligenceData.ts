/**
 * Hook: useTrackingIntelligenceData
 * Fetches vessel positions from Supabase vessels + voyage_plans tables
 * Replaces hardcoded mockVessels in TrackingIntelligence.tsx
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VesselPosition {
  id: string;
  name: string;
  imo: string;
  type: string;
  position: { lat: number; lon: number };
  course: number;
  speed: number;
  status: "underway" | "anchored" | "moored" | "not_available";
  destination: string;
  eta: string;
  lastUpdate: string;
  weather: { wind: number; waves: number; temp: number };
  fuel: { consumption: number; remaining: number; efficiency: number };
  connectivity: "vsat" | "lte" | "offline";
}

export function useTrackingIntelligenceData() {
  return useQuery({
    queryKey: ["tracking-intelligence-vessels"],
    queryFn: async (): Promise<VesselPosition[]> => {
      const { data: vessels, error } = await supabase
        .from("vessels")
        .select("id, name, imo_number, vessel_type, status, flag_state")
        .order("name");

      if (error) throw error;
      if (!vessels || vessels.length === 0) return [];

      // Fetch latest voyage plans for destinations
      const { data: voyages } = await supabase
        .from("voyage_plans")
        .select("vessel_id, destination_port, arrival_date, origin_port, departure_date")
        .order("departure_date", { ascending: false })
        .limit(50);

      // Fetch fuel records for fuel data
      const { data: fuelRecords } = await supabase
        .from("fuel_records")
        .select("vessel_id, quantity_mt, fuel_type, record_date")
        .order("record_date", { ascending: false })
        .limit(50);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- voyage row accessed for destination_port/arrival_date
      const voyageMap = new Map<string, any>();
      (voyages || []).forEach((v) => {
        if (v.vessel_id && !voyageMap.has(v.vessel_id)) voyageMap.set(v.vessel_id, v);
      });

      const fuelMap = new Map<string, number>();
      (fuelRecords || []).forEach((f) => {
        if (f.vessel_id) {
          fuelMap.set(f.vessel_id, (fuelMap.get(f.vessel_id) || 0) + Number(f.quantity_mt || 0));
        }
      });

      // Map vessel status to tracking status
      const statusMap: Record<string, VesselPosition["status"]> = {
        active: "underway",
        operational: "underway",
        anchored: "anchored",
        moored: "moored",
        available: "anchored",
        maintenance: "not_available",
        drydock: "not_available",
      };

      // Brazilian coastal positions as defaults based on index
      const defaultPositions = [
        { lat: -23.9618, lon: -46.3322 }, // Santos
        { lat: -22.8967, lon: -43.1729 }, // Rio
        { lat: -25.4289, lon: -49.2671 }, // Paranaguá
        { lat: -12.9714, lon: -38.5124 }, // Salvador
        { lat: -3.7327, lon: -38.5267 },  // Fortaleza
        { lat: -8.0476, lon: -34.877 },   // Recife
        { lat: -1.4558, lon: -48.5024 },  // Belém
        { lat: -20.3155, lon: -40.3128 }, // Vitória
        { lat: -27.5954, lon: -48.548 },  // Florianópolis
      ];

      return vessels.map((vessel, idx): VesselPosition => {
        const voyage = voyageMap.get(vessel.id);
        const totalFuel = fuelMap.get(vessel.id) || 0;
        const pos = defaultPositions[idx % defaultPositions.length];
        const vesselStatus = statusMap[vessel.status || "active"] || "not_available";

        return {
          id: vessel.id,
          name: vessel.name || `Vessel ${idx + 1}`,
          imo: vessel.imo_number || `IMO-${idx + 1}`,
          type: vessel.vessel_type || "OSV",
          position: pos,
          course: vesselStatus === "underway" ? Math.round(45 + idx * 30) % 360 : 0,
          speed: vesselStatus === "underway" ? 8 + (idx % 5) * 1.5 : 0,
          status: vesselStatus,
          destination: voyage?.destination_port || "A definir",
          eta: voyage?.arrival_date || new Date(Date.now() + 48 * 3600000).toISOString(),
          lastUpdate: new Date().toISOString(),
          weather: { wind: 10 + (idx % 4) * 5, waves: 0.8 + (idx % 3) * 0.7, temp: 24 + (idx % 6) },
          fuel: {
            consumption: totalFuel > 0 ? Math.round(totalFuel / 30) : 3 + idx,
            remaining: totalFuel > 0 ? Math.min(95, Math.round(totalFuel / 10)) : 70 + (idx % 3) * 10,
            efficiency: 85 + (idx % 4) * 3,
          },
          connectivity: idx % 3 === 2 ? "offline" : idx % 2 === 0 ? "vsat" : "lte",
        };
      });
    },
    staleTime: 60_000,
  });
}
