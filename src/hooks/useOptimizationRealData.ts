/**
 * Hook para dados reais do dashboard de otimização
 * Substitui mock data em UnifiedOptimizationDashboard
 * Calcula métricas de otimização a partir de voyage_plans + fuel_records reais
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OptimizationMetrics {
  totalVoyages: number;
  avgFuelEfficiency: number; // ton/nm
  totalFuelConsumed: number;
  totalDistance: number;
  potentialSavingsPercent: number;
  potentialSavingsCost: number;
  avgCostPerNm: number;
  bestRoute: string | null;
}

export interface VoyageOptimizationData {
  id: string;
  vesselName: string;
  origin: string;
  destination: string;
  distance: number;
  fuelConsumed: number;
  fuelEfficiency: number;
  estimatedCost: number;
  status: string;
}

export function useOptimizationRealData() {
  return useQuery({
    queryKey: ["optimization-real-data"],
    queryFn: async () => {
      const [voyagesRes, fuelRes, vesselsRes] = await Promise.all([
        supabase.from("voyage_plans").select("*").order("created_at", { ascending: false }),
        supabase.from("fuel_records").select("*").order("date", { ascending: false }),
        supabase.from("vessels").select("id, name"),
      ]);

      const voyages = voyagesRes.data || [];
      const fuels = fuelRes.data || [];
      const vessels = vesselsRes.data || [];

      const vesselMap = new Map(vessels.map(v => [v.id, v.name]));

      // Calculate fuel per vessel
      const fuelByVessel = new Map<string, number>();
      for (const fr of fuels) {
        const vid = fr.vessel_id;
        if (vid) {
          fuelByVessel.set(vid, (fuelByVessel.get(vid) || 0) + (fr.quantity_mt || 0));
        }
      }

      // Map voyages to optimization data
      const voyageData: VoyageOptimizationData[] = voyages.map(v => {
        const distance = v.distance_nm || 0;
        const vesselId = v.vessel_id || "";
        const fuelConsumed = fuelByVessel.get(vesselId) || distance * 0.08; // estimated
        const fuelEfficiency = distance > 0 ? fuelConsumed / distance : 0;
        const estimatedCost = fuelConsumed * 650; // avg bunker price USD/ton

        return {
          id: v.id,
          vesselName: vesselMap.get(vesselId) || "Unknown",
          origin: v.origin_port || "—",
          destination: v.destination_port || "—",
          distance,
          fuelConsumed: +fuelConsumed.toFixed(1),
          fuelEfficiency: +fuelEfficiency.toFixed(4),
          estimatedCost: +estimatedCost.toFixed(0),
          status: v.status || "planned",
        };
      });

      // Aggregate metrics
      const totalFuel = voyageData.reduce((s, v) => s + v.fuelConsumed, 0);
      const totalDistance = voyageData.reduce((s, v) => s + v.distance, 0);
      const avgEfficiency = totalDistance > 0 ? totalFuel / totalDistance : 0;
      const bestEfficiencyVoyage = voyageData.reduce((best, v) => 
        v.fuelEfficiency > 0 && (v.fuelEfficiency < best.fuelEfficiency || best.fuelEfficiency === 0) ? v : best,
        voyageData[0] || { fuelEfficiency: 0, origin: null, destination: null }
      );

      const metrics: OptimizationMetrics = {
        totalVoyages: voyageData.length,
        avgFuelEfficiency: +avgEfficiency.toFixed(4),
        totalFuelConsumed: +totalFuel.toFixed(1),
        totalDistance: +totalDistance.toFixed(0),
        potentialSavingsPercent: 8.5, // base industry benchmark
        potentialSavingsCost: +(totalFuel * 650 * 0.085).toFixed(0),
        avgCostPerNm: totalDistance > 0 ? +((totalFuel * 650) / totalDistance).toFixed(2) : 0,
        bestRoute: bestEfficiencyVoyage?.origin && bestEfficiencyVoyage?.destination
          ? `${bestEfficiencyVoyage.origin} → ${bestEfficiencyVoyage.destination}`
          : null,
      };

      return { metrics, voyages: voyageData };
    },
    staleTime: 5 * 60 * 1000,
  });
}
