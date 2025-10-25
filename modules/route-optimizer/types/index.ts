/**
 * Route Optimizer Module Types
 * PATCH 104.0
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export type RouteStatus = 'planned' | 'active' | 'completed' | 'cancelled' | 'delayed';

export interface Route {
  id: string;
  vessel_id: string;
  origin: string;
  origin_coordinates?: Coordinates;
  destination: string;
  destination_coordinates?: Coordinates;
  planned_departure?: string;
  estimated_arrival?: string;
  actual_arrival?: string;
  status: RouteStatus;
  distance_nm?: number;
  fuel_estimate?: number;
  fuel_actual?: number;
  weather_forecast?: WeatherForecast;
  route_geometry?: GeoJSONLineString;
  ai_recommendation?: string;
  ai_metadata?: Record<string, unknown>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WeatherForecast {
  waypoints: WeatherWaypoint[];
  alerts?: WeatherAlert[];
  summary?: string;
}

export interface WeatherWaypoint {
  location: Coordinates;
  distance_from_origin: number;
  timestamp: string;
  conditions: {
    temperature: number;
    wind_speed: number;
    wind_direction: number;
    wave_height?: number;
    visibility?: number;
    description: string;
  };
}

export interface WeatherAlert {
  severity: 'low' | 'moderate' | 'high' | 'severe';
  type: string;
  description: string;
  affected_area: Coordinates[];
}

export interface GeoJSONLineString {
  type: 'LineString';
  coordinates: [number, number][]; // [lng, lat]
}

export interface RouteOptimizationRequest {
  vessel_id: string;
  origin: string;
  destination: string;
  departure_date?: string;
  preferred_speed?: number;
}

export interface RouteOptimizationResult {
  route: Route;
  alternatives?: Route[];
  ai_analysis: {
    recommendation: string;
    fuel_efficiency_score: number;
    safety_score: number;
    time_efficiency_score: number;
    overall_score: number;
  };
}
