/**
 * Voyage Command Center - Types
 */

export interface Port {
  id: string;
  name: string;
  country: string;
  code: string;
  lat: number;
  lng: number;
  type: "origin" | "destination" | "waypoint";
}

export interface VoyageRoute {
  id: string;
  name: string;
  origin: Port;
  destination: Port;
  waypoints: Port[];
  distanceNm: number;
  estimatedDays: number;
  fuelConsumption: number;
  status: "planned" | "active" | "completed" | "cancelled";
  vesselName?: string;
  departureDate?: string;
  arrivalDate?: string;
  weatherRisk: "low" | "medium" | "high";
  createdAt: string;
  estimatedCost?: number;
  aiRecommendations?: string[];
}

export interface WeatherCondition {
  location: string;
  condition: string;
  windSpeed: number;
  waveHeight: number;
  visibility: string;
  risk: "low" | "medium" | "high";
}

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    planned: "bg-info/10 text-info",
    active: "bg-success/10 text-success",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive"
  };
  return colors[status] || colors.planned;
};

export const getWeatherColor = (risk: string) => {
  const colors: Record<string, string> = {
    low: "text-success",
    medium: "text-warning",
    high: "text-destructive"
  };
  return colors[risk] || colors.medium;
};

export const getWeatherBgColor = (risk: string) => {
  const colors: Record<string, string> = {
    low: "bg-success/10",
    medium: "bg-warning/10",
    high: "bg-destructive/10"
  };
  return colors[risk] || colors.medium;
};
