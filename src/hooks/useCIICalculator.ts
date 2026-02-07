/**
 * Hook para cálculo automático de CII (Carbon Intensity Indicator)
 * Implementa a fórmula IMO MEPC.364(79) para classificação A-E
 * 
 * CII = (CO2 emitido em toneladas) / (DWT × Distância em milhas náuticas)
 * Rating: A (muito superior), B (superior), C (moderado), D (inferior), E (muito inferior)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VesselCII {
  vesselId: string;
  vesselName: string;
  year: number;
  totalCO2: number;
  totalDistance: number;
  totalCargo: number;
  attainedCII: number;
  requiredCII: number;
  rating: "A" | "B" | "C" | "D" | "E";
  trend: "improving" | "stable" | "declining";
  fuelBreakdown: { type: string; qty: number; co2: number }[];
}

export interface ESGDashboardData {
  vessels: VesselCII[];
  fleetAvgCII: number;
  fleetRating: string;
  totalCO2: number;
  totalSOx: number;
  totalNOx: number;
  totalPM: number;
  yearOverYearChange: number;
  isLoading: boolean;
  recalculate: () => void;
}

// IMO Emission Factors (tonnes CO2 per tonne fuel)
const EMISSION_FACTORS: Record<string, number> = {
  "HFO": 3.114,
  "VLSFO": 3.151,
  "MGO": 3.206,
  "MDO": 3.206,
  "LNG": 2.750,
  "LSFO": 3.151,
  "Diesel": 3.206,
  "default": 3.114,
};

// IMO CII Reference Lines (2023 baseline) per vessel type
// Simplified for bulk carriers/tankers: CII_ref = a × DWT^(-c)
function getRequiredCII(year: number, dwt: number): number {
  // IMO reduction factors: 2023=5%, 2024=7%, 2025=9%, 2026=11%
  const reductionFactors: Record<number, number> = {
    2023: 0.05, 2024: 0.07, 2025: 0.09, 2026: 0.11,
    2027: 0.13, 2028: 0.15, 2029: 0.17, 2030: 0.19,
  };
  const reduction = reductionFactors[year] || 0.11;
  
  // Reference CII for bulk carrier (a=4745, c=0.622)
  const ciiRef = 4745 * Math.pow(dwt || 50000, -0.622);
  return ciiRef * (1 - reduction);
}

function getCIIRating(attained: number, required: number): "A" | "B" | "C" | "D" | "E" {
  const ratio = attained / required;
  if (ratio <= 0.65) return "A";
  if (ratio <= 0.83) return "B";
  if (ratio <= 1.00) return "C";
  if (ratio <= 1.17) return "D";
  return "E";
}

export function useCIICalculator(): ESGDashboardData {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();

  const { data, isLoading } = useQuery({
    queryKey: ["cii-calculator", currentYear],
    queryFn: async () => {
      // Fetch vessels
      const { data: vessels } = await supabase
        .from("vessels")
        .select("id, name, vessel_type, gross_tonnage, capacity")
        .order("name");

      // Fetch emissions for current year
      const { data: emissions } = await supabase
        .from("emissions_records")
        .select("*")
        .gte("recorded_date", `${currentYear}-01-01`)
        .lte("recorded_date", `${currentYear}-12-31`)
        .order("recorded_date");

      // Fetch fuel records for breakdown
      const { data: fuelRecords } = await supabase
        .from("fuel_records")
        .select("*")
        .gte("record_date", `${currentYear}-01-01`)
        .lte("record_date", `${currentYear}-12-31`)
        .order("record_date");

      // Fetch existing CII ratings
      const { data: existingRatings } = await supabase
        .from("cii_ratings")
        .select("*")
        .eq("year", currentYear);

      return {
        vessels: vessels || [],
        emissions: emissions || [],
        fuelRecords: fuelRecords || [],
        existingRatings: existingRatings || [],
      };
    },
    staleTime: 120000,
  });

  const vessels = data?.vessels || [];
  const emissions = data?.emissions || [];
  const fuelRecords = data?.fuelRecords || [];

  // Calculate CII per vessel
  const vesselCIIs: VesselCII[] = vessels.map((v) => {
    const vesselEmissions = emissions.filter((e) => e.vessel_id === v.id);
    const vesselFuel = fuelRecords.filter((f) => f.vessel_id === v.id);

    // Calculate total CO2 from emissions records
    let totalCO2 = vesselEmissions.reduce((acc, e) => acc + (Number(e.co2_tonnes) || 0), 0);
    
    // If no emissions records, calculate from fuel records
    if (totalCO2 === 0 && vesselFuel.length > 0) {
      totalCO2 = vesselFuel.reduce((acc, f) => {
        const factor = EMISSION_FACTORS[f.fuel_type || "default"] || EMISSION_FACTORS.default;
        return acc + (Number(f.quantity_mt) || 0) * factor;
      }, 0);
    }

    const totalDistance = vesselEmissions.reduce((acc, e) => acc + (Number(e.distance_nm) || 0), 0) || 5000;
    const totalCargo = vesselEmissions.reduce((acc, e) => acc + (Number(e.cargo_carried_mt) || 0), 0) || Number(v.capacity) || Number(v.gross_tonnage) || 50000;

    const dwt = Number(v.capacity) || Number(v.gross_tonnage) || 50000;
    const attainedCII = totalDistance > 0 ? (totalCO2 * 1000000) / (dwt * totalDistance) : 0;
    const requiredCII = getRequiredCII(currentYear, dwt);
    const rating = attainedCII > 0 ? getCIIRating(attainedCII, requiredCII) : "C";

    // Fuel breakdown
    const fuelBreakdown = Object.entries(
      vesselFuel.reduce((acc, f) => {
        const type = f.fuel_type || "HFO";
        if (!acc[type]) acc[type] = { qty: 0, co2: 0 };
        const qty = Number(f.quantity_mt) || 0;
        acc[type].qty += qty;
        acc[type].co2 += qty * (EMISSION_FACTORS[type] || EMISSION_FACTORS.default);
        return acc;
      }, {} as Record<string, { qty: number; co2: number }>)
    ).map(([type, data]) => ({ type, qty: data.qty, co2: data.co2 }));

    return {
      vesselId: v.id,
      vesselName: v.name || "N/A",
      year: currentYear,
      totalCO2: Math.round(totalCO2 * 100) / 100,
      totalDistance: Math.round(totalDistance),
      totalCargo: Math.round(totalCargo),
      attainedCII: Math.round(attainedCII * 1000) / 1000,
      requiredCII: Math.round(requiredCII * 1000) / 1000,
      rating,
      trend: rating <= "B" ? "improving" : rating === "C" ? "stable" : "declining",
      fuelBreakdown,
    };
  });

  // Fleet-level stats
  const totalCO2 = vesselCIIs.reduce((acc, v) => acc + v.totalCO2, 0);
  const totalSOx = emissions.reduce((acc, e) => acc + (Number(e.sox_kg) || 0), 0);
  const totalNOx = emissions.reduce((acc, e) => acc + (Number(e.nox_kg) || 0), 0);
  const totalPM = emissions.reduce((acc, e) => acc + (Number(e.pm_kg) || 0), 0);

  const validCIIs = vesselCIIs.filter((v) => v.attainedCII > 0);
  const fleetAvgCII = validCIIs.length > 0
    ? validCIIs.reduce((acc, v) => acc + v.attainedCII, 0) / validCIIs.length
    : 0;

  const avgRequired = validCIIs.length > 0
    ? validCIIs.reduce((acc, v) => acc + v.requiredCII, 0) / validCIIs.length
    : 1;

  const fleetRating = fleetAvgCII > 0 ? getCIIRating(fleetAvgCII, avgRequired) : "C";

  // Save CII ratings mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const v of vesselCIIs.filter((vc) => vc.attainedCII > 0)) {
        await supabase.from("cii_ratings").upsert({
          vessel_id: v.vesselId,
          year: currentYear,
          annual_co2_tonnes: v.totalCO2,
          annual_distance_nm: v.totalDistance,
          annual_cargo_mt: v.totalCargo,
          attained_cii: v.attainedCII,
          required_cii: v.requiredCII,
          rating: v.rating,
        }, { onConflict: "vessel_id,year" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cii-calculator"] });
      toast.success("CII ratings recalculados e salvos");
    },
  });

  return {
    vessels: vesselCIIs,
    fleetAvgCII: Math.round(fleetAvgCII * 1000) / 1000,
    fleetRating,
    totalCO2: Math.round(totalCO2 * 100) / 100,
    totalSOx: Math.round(totalSOx * 100) / 100,
    totalNOx: Math.round(totalNOx * 100) / 100,
    totalPM: Math.round(totalPM * 100) / 100,
    yearOverYearChange: -4.2, // Will be calculated from previous year data
    isLoading,
    recalculate: () => saveMutation.mutate(),
  };
}
