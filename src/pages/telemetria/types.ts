/**
 * Telemetria Command Center - Types & Helpers
 */

import React from "react";
import { Thermometer, Gauge, Zap, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface TelemetryLog {
  id: string;
  sensor_id: string;
  sensor_type: string;
  value: number;
  unit: string | null;
  status: string;
  location: string | null;
  timestamp: string;
}

export interface TelemetryAlert {
  id: string;
  sensor_id: string;
  alert_type: string;
  severity: string;
  message: string;
  recommended_action: string | null;
  acknowledged: boolean;
  resolved: boolean;
  created_at: string;
}

export const getSensorIcon = (type: string) => {
  switch (type) {
    case "temperature": return React.createElement(Thermometer, { className: "h-4 w-4" });
    case "pressure": return React.createElement(Gauge, { className: "h-4 w-4" });
    case "fuel_level": return React.createElement(Zap, { className: "h-4 w-4" });
    default: return React.createElement(Activity, { className: "h-4 w-4" });
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "normal": return "bg-success";
    case "warning": return "bg-warning";
    case "critical": return "bg-destructive";
    case "offline": return "bg-muted-foreground";
    default: return "bg-primary";
  }
};

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case "critical": return React.createElement(Badge, { variant: "destructive" }, "Crítico");
    case "high": return React.createElement(Badge, { className: "bg-warning text-warning-foreground" }, "Alto");
    case "medium": return React.createElement(Badge, { className: "bg-warning/80 text-warning-foreground" }, "Médio");
    default: return React.createElement(Badge, { variant: "secondary" }, "Baixo");
  }
};
