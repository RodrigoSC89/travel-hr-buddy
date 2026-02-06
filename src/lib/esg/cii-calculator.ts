/**
 * CII Calculator - Carbon Intensity Indicator (IMO 2023+)
 * 
 * Fórmula oficial IMO:
 * CII = (CO2 Emissions × 10^6) / (DWT × Distance)
 * 
 * Onde:
 * - CO2 Emissions = Consumo de combustível × Fator de emissão (tonnes)
 * - DWT = Deadweight Tonnage (tonnes)
 * - Distance = Distância percorrida (nautical miles)
 * 
 * Ratings: A (melhor) → E (pior)
 * D/E por 3 anos consecutivos = ações corretivas obrigatórias
 */

import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Fatores de emissão de CO2 por tipo de combustível (tCO2/t fuel)
// Fonte: IMO MEPC.308(73) - 2018 Guidelines
export const EMISSION_FACTORS: Record<string, number> = {
  // Heavy Fuel Oils
  hfo: 3.114,      // Heavy Fuel Oil (Residual)
  ulsfo: 3.151,    // Ultra Low Sulfur Fuel Oil
  vlsfo: 3.151,    // Very Low Sulfur Fuel Oil
  
  // Distillates
  mdo: 3.206,      // Marine Diesel Oil
  mgo: 3.206,      // Marine Gas Oil
  lfo: 3.151,      // Light Fuel Oil
  
  // Alternative Fuels
  lng: 2.750,      // Liquefied Natural Gas
  lpg: 3.000,      // Liquefied Petroleum Gas
  methanol: 1.375, // Methanol
  ethanol: 1.913,  // Ethanol
  
  // Zero/Low Carbon (biofuels, hydrogen, ammonia)
  biofuel: 0,      // Sustainable biofuel (net zero)
  hydrogen: 0,     // Green hydrogen
  ammonia: 0,      // Green ammonia
};

// Limites de rating CII por tipo de embarcação (2024)
// Fonte: MEPC.354(78) - CII Reference Lines and Rating Boundaries
export const CII_BOUNDARIES: Record<string, { d1: number; d2: number; d3: number; d4: number }> = {
  // Bulk Carrier
  bulk_carrier: { d1: 0.86, d2: 0.94, d3: 1.06, d4: 1.18 },
  
  // Tanker
  tanker: { d1: 0.82, d2: 0.93, d3: 1.08, d4: 1.28 },
  
  // Container Ship
  container: { d1: 0.83, d2: 0.94, d3: 1.07, d4: 1.19 },
  
  // General Cargo
  general_cargo: { d1: 0.83, d2: 0.94, d3: 1.06, d4: 1.19 },
  
  // LNG Carrier
  lng_carrier: { d1: 0.89, d2: 0.98, d3: 1.06, d4: 1.13 },
  
  // Ro-Ro Cargo/Vehicle
  roro: { d1: 0.86, d2: 0.94, d3: 1.06, d4: 1.18 },
  
  // Cruise/Passenger
  cruise: { d1: 0.87, d2: 0.95, d3: 1.06, d4: 1.16 },
  
  // Offshore/OSV/PSV/AHTS
  offshore: { d1: 0.90, d2: 0.96, d3: 1.04, d4: 1.12 },
  
  // Default
  default: { d1: 0.85, d2: 0.95, d3: 1.05, d4: 1.18 },
};

// Fatores de redução anual (Z factor) - MEPC.338(76)
export const REDUCTION_FACTORS: Record<number, number> = {
  2023: 0.05,  // 5% reduction from 2019 baseline
  2024: 0.07,  // 7%
  2025: 0.09,  // 9%
  2026: 0.11,  // 11%
  2027: 0.13,  // 13% (Phase 2 starts)
  2028: 0.15,
  2029: 0.17,
  2030: 0.19,
  2031: 0.21,
  2032: 0.23,
  2033: 0.25,
  2034: 0.27,
  2035: 0.29,
  2036: 0.31,
  2037: 0.33,
  2038: 0.35,
  2039: 0.37,
  2040: 0.40,  // Target: 40% reduction by 2040
};

export interface CIIInput {
  vesselId: string;
  vesselType: string;
  dwt: number;
  fuelConsumption: { fuelType: string; quantity: number }[];
  distanceNm: number;
  year?: number;
  correctionFactors?: {
    iceClass?: number;      // Fc,ice - Ice-class correction
    voluntaryReduction?: number; // Voluntary speed reduction credit
    electricalPower?: number;  // Shore power correction
    shuttleTanker?: number;  // Shuttle tanker correction
  };
}

export interface CIIResult {
  attainedCII: number;       // Actual CII value (gCO2/DWT-nm)
  requiredCII: number;       // Required CII based on type and year
  rating: 'A' | 'B' | 'C' | 'D' | 'E';
  totalCO2: number;          // Total CO2 emissions (tonnes)
  emissionsByFuel: Record<string, number>;
  complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  reductionRequired: number; // % reduction needed if non-compliant
  yearOnYearChange?: number; // % change from previous year
}

/**
 * Calculate CO2 emissions from fuel consumption
 */
export function calculateCO2Emissions(
  fuelConsumption: { fuelType: string; quantity: number }[]
): { totalCO2: number; emissionsByFuel: Record<string, number> } {
  const emissionsByFuel: Record<string, number> = {};
  let totalCO2 = 0;

  for (const fuel of fuelConsumption) {
    const normalizedType = fuel.fuelType.toLowerCase().replace(/[^a-z]/g, '');
    const factor = EMISSION_FACTORS[normalizedType] || EMISSION_FACTORS.hfo;
    const co2 = fuel.quantity * factor;
    
    emissionsByFuel[fuel.fuelType] = co2;
    totalCO2 += co2;
  }

  return { totalCO2, emissionsByFuel };
}

/**
 * Calculate attained CII value
 */
export function calculateAttainedCII(
  totalCO2: number,
  dwt: number,
  distanceNm: number,
  correctionFactors?: CIIInput['correctionFactors']
): number {
  if (dwt <= 0 || distanceNm <= 0) return 0;

  // Base CII calculation: (CO2 * 10^6) / (DWT * Distance)
  let cii = (totalCO2 * 1000000) / (dwt * distanceNm);

  // Apply correction factors if provided
  if (correctionFactors) {
    const totalCorrection = 1 - (
      (correctionFactors.iceClass || 0) +
      (correctionFactors.voluntaryReduction || 0) +
      (correctionFactors.electricalPower || 0) +
      (correctionFactors.shuttleTanker || 0)
    );
    cii *= Math.max(0.5, totalCorrection); // Minimum 50% of original
  }

  return cii;
}

/**
 * Get CII reference line value for vessel type and DWT
 */
export function getCIIReferenceLine(vesselType: string, dwt: number): number {
  // Simplified reference line calculation
  // In reality, this uses complex formulas per vessel type
  // CIIref = a × DWT^(-c)
  
  const coefficients: Record<string, { a: number; c: number }> = {
    bulk_carrier: { a: 4745, c: 0.622 },
    tanker: { a: 5247, c: 0.610 },
    container: { a: 1984, c: 0.489 },
    general_cargo: { a: 107.48, c: 0.216 },
    lng_carrier: { a: 144050000000, c: 2.071 },
    roro: { a: 10952, c: 0.637 },
    cruise: { a: 930, c: 0.383 },
    offshore: { a: 3500, c: 0.500 },
    default: { a: 2000, c: 0.500 },
  };

  const normalizedType = vesselType.toLowerCase().replace(/[^a-z_]/g, '');
  const coeff = coefficients[normalizedType] || coefficients.default;
  
  return coeff.a * Math.pow(dwt, -coeff.c);
}

/**
 * Get required CII for a given year (with reduction factor)
 */
export function getRequiredCII(referenceValue: number, year: number = new Date().getFullYear()): number {
  const reductionFactor = REDUCTION_FACTORS[year] || REDUCTION_FACTORS[2024];
  return referenceValue * (1 - reductionFactor);
}

/**
 * Determine CII rating based on attained vs boundaries
 */
export function getCIIRating(
  attainedCII: number,
  requiredCII: number,
  vesselType: string
): 'A' | 'B' | 'C' | 'D' | 'E' {
  const normalizedType = vesselType.toLowerCase().replace(/[^a-z_]/g, '');
  const boundaries = CII_BOUNDARIES[normalizedType] || CII_BOUNDARIES.default;
  
  const ratio = attainedCII / requiredCII;
  
  if (ratio <= boundaries.d1) return 'A';
  if (ratio <= boundaries.d2) return 'B';
  if (ratio <= boundaries.d3) return 'C';
  if (ratio <= boundaries.d4) return 'D';
  return 'E';
}

/**
 * Main CII calculation function
 */
export function calculateCII(input: CIIInput): CIIResult {
  const year = input.year || new Date().getFullYear();
  
  // Calculate CO2 emissions
  const { totalCO2, emissionsByFuel } = calculateCO2Emissions(input.fuelConsumption);
  
  // Calculate attained CII
  const attainedCII = calculateAttainedCII(
    totalCO2,
    input.dwt,
    input.distanceNm,
    input.correctionFactors
  );
  
  // Get reference and required CII
  const referenceCII = getCIIReferenceLine(input.vesselType, input.dwt);
  const requiredCII = getRequiredCII(referenceCII, year);
  
  // Determine rating
  const rating = getCIIRating(attainedCII, requiredCII, input.vesselType);
  
  // Determine compliance status
  let complianceStatus: 'compliant' | 'warning' | 'non_compliant';
  if (rating === 'A' || rating === 'B' || rating === 'C') {
    complianceStatus = 'compliant';
  } else if (rating === 'D') {
    complianceStatus = 'warning';
  } else {
    complianceStatus = 'non_compliant';
  }
  
  // Calculate reduction required if non-compliant
  const reductionRequired = attainedCII > requiredCII 
    ? ((attainedCII - requiredCII) / attainedCII) * 100 
    : 0;
  
  return {
    attainedCII: Math.round(attainedCII * 100) / 100,
    requiredCII: Math.round(requiredCII * 100) / 100,
    rating,
    totalCO2: Math.round(totalCO2 * 10) / 10,
    emissionsByFuel,
    complianceStatus,
    reductionRequired: Math.round(reductionRequired * 10) / 10,
  };
}

/**
 * Get CII projection for remaining year
 */
export function projectCII(
  currentCII: number,
  monthsCompleted: number,
  plannedMeasures: { measure: string; reduction: number }[] = []
): { projectedCII: number; projectedRating: 'A' | 'B' | 'C' | 'D' | 'E' } {
  const remainingMonths = 12 - monthsCompleted;
  
  // Calculate expected reduction from measures
  const totalReduction = plannedMeasures.reduce((sum, m) => sum + m.reduction, 0) / 100;
  
  // Projected CII = current * (1 - expected reduction)
  const projectedCII = currentCII * (1 - totalReduction * (remainingMonths / 12));
  
  // Simplified rating projection (would need actual boundaries)
  let projectedRating: 'A' | 'B' | 'C' | 'D' | 'E';
  if (projectedCII < 4) projectedRating = 'A';
  else if (projectedCII < 6) projectedRating = 'B';
  else if (projectedCII < 8) projectedRating = 'C';
  else if (projectedCII < 10) projectedRating = 'D';
  else projectedRating = 'E';
  
  return { projectedCII: Math.round(projectedCII * 100) / 100, projectedRating };
}
