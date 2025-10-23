/**
 * Control Hub Types
 * Nautilus One Phase 4 - Control Hub Implementation
 */

export type ModuleStatus = "operational" | "degraded" | "offline" | "error";
export type SystemHealth = "healthy" | "degraded" | "critical";
export type ConnectionQuality = "excellent" | "good" | "poor" | "offline";

export interface ModuleState {
  name: string;
  status: ModuleStatus;
  uptime: number;
  lastCheck: Date;
  errors: number;
  performance: number;
}

export interface CacheEntry {
  id: string;
  timestamp: Date;
  data: any;
  module: string;
  synchronized: boolean;
}

export interface ControlHubState {
  modules: Record<string, ModuleState>;
  connectionQuality: ConnectionQuality;
  cacheSize: number;
  cacheCapacity: number;
  pendingRecords: number;
  lastSync: Date | null;
  systemHealth: SystemHealth;
}

export interface SyncResult {
  success: boolean;
  recordsSent: number;
  recordsFailed: number;
  errors: string[];
}

export interface HealthCheckResult {
  status: SystemHealth;
  timestamp: Date;
  modules: Record<string, ModuleStatus>;
  uptime: number;
}
