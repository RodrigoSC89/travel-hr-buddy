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
    planned: "bg-blue-500/10 text-blue-600",
    active: "bg-green-500/10 text-green-600",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-red-500/10 text-red-600"
  };
  return colors[status] || colors.planned;
};

export const getWeatherColor = (risk: string) => {
  const colors: Record<string, string> = {
    low: "text-green-500",
    medium: "text-amber-500",
    high: "text-red-500"
  };
  return colors[risk] || colors.medium;
};

export const getWeatherBgColor = (risk: string) => {
  const colors: Record<string, string> = {
    low: "bg-green-500/10",
    medium: "bg-amber-500/10",
    high: "bg-red-500/10"
  };
  return colors[risk] || colors.medium;
};
