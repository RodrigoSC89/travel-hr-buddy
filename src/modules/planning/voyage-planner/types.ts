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
  vesselId?: string;
  vesselName?: string;
  departureDate?: string;
  arrivalDate?: string;
  weatherRisk: "low" | "medium" | "high";
  createdAt: string;
}

export interface VoyageOptimization {
  suggestedRoute: Port[];
  fuelSavings: number;
  timeSavings: number;
  weatherAlerts: string[];
  recommendations: string[];
}

export interface WeatherCondition {
  location: string;
  condition: string;
  windSpeed: number;
  waveHeight: number;
  visibility: string;
  risk: "low" | "medium" | "high";
}
