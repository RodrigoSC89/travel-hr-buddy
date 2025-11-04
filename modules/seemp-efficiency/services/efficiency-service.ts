/**
 * SEEMP Efficiency Service
 * PATCH 647 - Fuel and emissions monitoring service
 */

import { Logger } from "@/lib/utils/logger";
import type { FuelLog, EnergySimulation, SEEMPMetrics } from "../types";

const MODULE_NAME = "seemp-efficiency";

/**
 * Calculate CO2 emissions from fuel consumption
 * Using IMO emission factors
 */
export function calculateCO2Emissions(fuelType: string, consumption: number): number {
  const emissionFactors: Record<string, number> = {
    HFO: 3.114, // tons CO2 per ton fuel
    MDO: 3.206,
    LNG: 2.750,
    MGO: 3.206,
    VLSFO: 3.151
  };

  const factor = emissionFactors[fuelType] || 3.114;
  return consumption * factor;
}

/**
 * Calculate efficiency metrics for a period
 */
export function calculateEfficiencyMetrics(
  fuelLogs: FuelLog[],
  periodStart: string,
  periodEnd: string,
  vesselId: string
): SEEMPMetrics {
  const totalFuel = fuelLogs.reduce((sum, log) => sum + log.consumption, 0);
  const totalDistance = fuelLogs.reduce((sum, log) => sum + (log.distance_traveled || 0), 0);
  const avgConsumptionPerNm = totalDistance > 0 ? totalFuel / totalDistance : 0;
  
  const totalCO2 = fuelLogs.reduce((sum, log) => {
    return sum + calculateCO2Emissions(log.fuel_type, log.consumption);
  }, 0);

  Logger.info("Calculated SEEMP metrics", {
    vessel_id: vesselId,
    total_fuel: totalFuel,
    total_distance: totalDistance,
    co2_emissions: totalCO2
  });

  return {
    vessel_id: vesselId,
    period_start: periodStart,
    period_end: periodEnd,
    total_fuel_consumed: totalFuel,
    total_distance: totalDistance,
    average_consumption_per_nm: avgConsumptionPerNm,
    co2_emissions: totalCO2,
    efficiency_trend: "stable",
    baseline_comparison: 0
  };
}

/**
 * Generate AI-powered efficiency recommendations
 */
export async function generateEfficiencyRecommendations(
  metrics: SEEMPMetrics
): Promise<string> {
  try {
    Logger.module(MODULE_NAME, "Generating AI efficiency recommendations");
    
    // In production, integrate with LLM service
    const recommendations = [
      `Current consumption: ${metrics.average_consumption_per_nm.toFixed(2)} units/nm`,
      `Total CO2 emissions: ${metrics.co2_emissions.toFixed(2)} tons`,
      "Consider implementing speed optimization during favorable weather conditions",
      "Hull cleaning recommended if efficiency has declined >5%",
      "Weather routing could reduce consumption by 3-8%"
    ];

    return recommendations.join("\n• ");
  } catch (error) {
    Logger.error("Failed to generate recommendations", error, MODULE_NAME);
    return "Unable to generate recommendations at this time";
  }
}

/**
 * Simulate energy optimization scenarios
 */
export function simulateOptimization(
  baseline: number,
  optimizationActions: string[]
): EnergySimulation {
  // Simple simulation model - in production, use more sophisticated algorithms
  const savingsPerAction: Record<string, number> = {
    speed_optimization: 0.15,
    route_optimization: 0.08,
    engine_tuning: 0.05,
    hull_cleaning: 0.10,
    propeller_polishing: 0.07,
    weather_routing: 0.06
  };

  let totalSavings = 0;
  optimizationActions.forEach(action => {
    totalSavings += savingsPerAction[action] || 0;
  });

  const optimizedConsumption = baseline * (1 - totalSavings);
  const savings = baseline - optimizedConsumption;
  const savingsPercent = (savings / baseline) * 100;

  return {
    id: crypto.randomUUID(),
    vessel_id: "",
    simulation_name: "Optimization Scenario",
    baseline_consumption: baseline,
    optimized_consumption: optimizedConsumption,
    estimated_savings: savings,
    estimated_savings_percent: savingsPercent,
    optimization_actions: optimizationActions,
    created_at: new Date().toISOString(),
  };
}
