// BridgeLink Module Types
export interface DPEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "normal" | "degradation" | "critical";
  system: string;
  description: string;
  vessel?: string;
  location?: string;
  metadata?: Record<string, unknown>;
}

export interface RiskAlert {
  id: string;
  level: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  source: string;
  recommendations?: string[];
}

export interface SystemStatus {
  overall: "Normal" | "Degradation" | "Critical" | "Offline" | "Desconhecido";
  subsystems: {
    name: string;
    status: "operational" | "degraded" | "offline";
    lastUpdate: string;
  }[];
}

export interface BridgeLinkData {
  dpEvents: DPEvent[];
  riskAlerts: RiskAlert[];
  status: string;
  systemStatus?: SystemStatus;
}

export interface ASGOEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  operator: string;
}

export interface FMEAAnalysis {
  component: string;
  failureMode: string;
  effects: string[];
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
}
