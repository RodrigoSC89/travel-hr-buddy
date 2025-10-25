/**
 * Weather Station Module Types
 * PATCH 105.0
 */

export interface WeatherLocation {
  lat: number;
  lng: number;
}

export type WeatherSeverity = "none" | "low" | "moderate" | "high" | "severe";

export interface CurrentConditions {
  temperature: number;
  feels_like?: number;
  wind_speed: number;
  wind_direction: number;
  humidity: number;
  pressure?: number;
  visibility: number;
  description: string;
  icon?: string;
}

export interface WeatherForecastHour {
  timestamp: string;
  temperature: number;
  wind_speed: number;
  wind_direction: number;
  humidity: number;
  precipitation_probability?: number;
  description: string;
  icon?: string;
}

export interface WeatherData {
  id: string;
  timestamp: string;
  vessel_id?: string;
  location: WeatherLocation;
  location_name?: string;
  forecast?: {
    hourly?: WeatherForecastHour[];
    daily?: WeatherForecastHour[];
  };
  current_conditions?: CurrentConditions;
  alerts?: WeatherAlertData[];
  severity: WeatherSeverity;
  alert_sent: boolean;
  created_at: string;
}

export interface WeatherAlertData {
  event: string;
  severity: string;
  description: string;
  start: string;
  end: string;
}

export interface WeatherAlert {
  id: string;
  vessel_id?: string;
  alert_type: string;
  severity: WeatherSeverity;
  title: string;
  description: string;
  location?: WeatherLocation;
  start_time?: string;
  end_time?: string;
  acknowledged: boolean;
  acknowledged_at?: string;
  acknowledged_by?: string;
  created_at: string;
}

export interface WeatherStationStats {
  total_alerts: number;
  active_alerts: number;
  severe_alerts: number;
  vessels_monitored: number;
}
