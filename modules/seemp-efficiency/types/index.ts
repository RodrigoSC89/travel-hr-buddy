/**
 * SEEMP Efficiency Module - Type Definitions
 * PATCH 647 - Ship Energy Efficiency Management Plan (IMO SEEMP)
 */

export type FuelType = "HFO" | "MDO" | "LNG" | "MGO" | "VLSFO";
export type VesselMode = "sailing" | "maneuvering" | "at_anchor" | "in_port" | "dp_operation";

export interface FuelLog {
  id: string;
  vessel_id: string;
  timestamp: string;
  fuel_type: FuelType;
  consumption: number; // liters or tons
  distance_traveled?: number; // nautical miles
  operating_hours: number;
  vessel_mode: VesselMode;
  weather_conditions?: string;
  created_by?: string;
  created_at: string;
}

export interface EnergySimulation {
  id: string;
  vessel_id: string;
  simulation_name: string;
  baseline_consumption: number;
  optimized_consumption: number;
  estimated_savings: number;
  estimated_savings_percent: number;
  optimization_actions: string[];
  simulation_parameters: Record<string, any>;
  ai_recommendations?: string;
  created_at: string;
  created_by?: string;
}

export interface SEEMPMetrics {
  vessel_id: string;
  period_start: string;
  period_end: string;
  total_fuel_consumed: number;
  total_distance: number;
  average_consumption_per_nm: number;
  co2_emissions: number; // tons
  efficiency_trend: "improving" | "stable" | "declining";
  baseline_comparison: number; // percentage vs baseline
}

export interface EmissionReport {
  id: string;
  vessel_id: string;
  report_period: string;
  total_co2: number;
  total_nox: number;
  total_sox: number;
  fuel_breakdown: Record<FuelType, number>;
  compliance_status: "compliant" | "warning" | "non_compliant";
  imo_reference?: string;
  created_at: string;
}

export interface EfficiencyAction {
  id: string;
  vessel_id: string;
  action_type: "speed_optimization" | "route_optimization" | "engine_tuning" | "hull_cleaning" | "propeller_polishing" | "weather_routing";
  description: string;
  expected_savings: number;
  actual_savings?: number;
  status: "planned" | "in_progress" | "completed" | "cancelled";
  implementation_date?: string;
  completion_date?: string;
  created_by?: string;
  created_at: string;
}
