/**
 * System Hub Module Types
 */

export interface Integration {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  enabled: boolean;
  healthScore: number;
}

export interface IntegrationLog {
  id: string;
  type: "sync" | "error" | "warning" | "info";
  message: string;
  timestamp: string;
}
