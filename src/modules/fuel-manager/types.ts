/**
 * Fuel Manager Types
 */

export interface FuelConsumption {
  id: string;
  vessel_id: string;
  vessel_name?: string;
  voyage_id?: string;
  consumption_date: string;
  fuel_type: "MGO" | "HFO" | "VLSFO" | "LNG";
  quantity_liters: number;
  cost_usd: number;
  distance_nm: number;
  avg_speed_knots: number;
  weather_conditions?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface FuelPrediction {
  vessel_id: string;
  vessel_name?: string;
  predicted_consumption: number;
  confidence: number;
  recommended_refuel_date: string;
  estimated_cost: number;
  savings_opportunity: number;
  optimization_suggestions?: string[];
}

export interface FuelStats {
  total_consumption: number;
  total_cost: number;
  avg_efficiency: number;
  best_efficiency: number;
  worst_efficiency: number;
  monthly_trend: number;
}
