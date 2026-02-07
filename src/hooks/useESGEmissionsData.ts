/**
 * Hook: ESG Emissions Data
 * Connects ESGEmissionsTracker to real Supabase data
 * Sources: emissions_records, vessels
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface VesselCII {
  vessel: string;
  rating: "A" | "B" | "C" | "D" | "E";
  ciiValue: number;
  target: number;
  trend: "improving" | "stable" | "declining";
  co2Emissions: number;
  voyagesCount: number;
}

export interface EmissionsTrend {
  month: string;
  emissions: number;
  target: number;
}

function getCIIRating(cii: number): "A" | "B" | "C" | "D" | "E" {
  if (cii <= 7.5) return "A";
  if (cii <= 10) return "B";
  if (cii <= 13) return "C";
  if (cii <= 16) return "D";
  return "E";
}

export function useESGEmissionsData() {
  const { data, isLoading } = useQuery({
    queryKey: ["esg-emissions-data"],
    queryFn: async () => {
      const { data: records, error } = await supabase
        .from("emissions_records")
        .select("*, vessels(name)")
        .order("recorded_date", { ascending: false })
        .limit(100);

      if (error) throw error;

      // Group by vessel for CII
      const byVessel = new Map<string, any[]>();
      for (const r of records || []) {
        const vName = r.vessels?.name || "Vessel";
        if (!byVessel.has(vName)) byVessel.set(vName, []);
        byVessel.get(vName)!.push(r);
      }

      const vesselCII: VesselCII[] = Array.from(byVessel.entries()).map(([vessel, recs]) => {
        const avgCI = recs.reduce((s, r) => s + (Number(r.carbon_intensity) || 0), 0) / recs.length;
        const totalCO2 = recs.reduce((s, r) => s + (Number(r.co2_tonnes) || 0), 0);
        const ciiValue = Math.round(avgCI * 10) / 10;
        const rating = getCIIRating(ciiValue);
        // Target is ~15% lower than current (IMO reduction goal)
        const target = Math.round(ciiValue * 0.85 * 10) / 10;

        return {
          vessel,
          rating,
          ciiValue,
          target,
          trend: ciiValue <= target ? "improving" as const : ciiValue > target * 1.2 ? "declining" as const : "stable" as const,
          co2Emissions: Math.round(totalCO2),
          voyagesCount: recs.length,
        };
      });

      // Build monthly trend
      const byMonth = new Map<string, number>();
      for (const r of records || []) {
        const dateStr = r.recorded_date || r.created_at || new Date().toISOString();
        const date = new Date(dateStr);
        const key = date.toLocaleString("pt-BR", { month: "short" });
        byMonth.set(key, (byMonth.get(key) || 0) + (Number(r.co2_tonnes) || 0));
      }

      const totalAvg = Array.from(byMonth.values()).reduce((s, v) => s + v, 0) / Math.max(byMonth.size, 1);
      const emissionsTrend: EmissionsTrend[] = Array.from(byMonth.entries()).map(([month, emissions]) => ({
        month,
        emissions: Math.round(emissions),
        target: Math.round(totalAvg * 0.9), // 10% below average as target
      }));

      return { vesselCII, emissionsTrend };
    },
  });

  return {
    vesselCII: data?.vesselCII || [],
    emissionsTrend: data?.emissionsTrend || [],
    isLoading,
  };
}
