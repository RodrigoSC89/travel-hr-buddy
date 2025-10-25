/**
 * ControlHub Types
 * Type definitions for ControlHub 2.0 module
 */

import { ForecastData } from "./forecast";
import { AIAdvice } from "./ai";

export interface ControlHubData {
  forecast: ForecastData | null;
  advice: AIAdvice | null;
  alerts: Alert[];
  systemStatus: SystemStatus;
}

export interface Alert {
  id: string;
  title: string;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

export interface SystemStatus {
  overall: "healthy" | "degraded" | "critical";
  modules: ModuleStatus[];
}

export interface ModuleStatus {
  name: string;
  status: "online" | "offline" | "degraded";
  lastUpdate?: string;
}

export interface AnomalyData {
  title: string;
  risk: "low" | "medium" | "high" | "critical";
  trend: "up" | "down" | "stable";
  description?: string;
}
