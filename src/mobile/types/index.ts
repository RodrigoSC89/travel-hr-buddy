/**
 * PATCH 161.0 - Mobile App Types
 */

export interface MobileChecklist {
  id: string;
  title: string;
  category: "operational" | "safety" | "maintenance" | "inspection";
  items: ChecklistItem[];
  completed: boolean;
  lastModified: number;
  syncStatus: "synced" | "pending" | "failed";
}

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  required: boolean;
  notes?: string;
}

export interface MissionDashboard {
  missionId: string;
  missionName: string;
  status: "active" | "completed" | "pending";
  progress: number;
  checklistsCompleted: number;
  checklistsTotal: number;
  lastUpdate: number;
  criticalItems: number;
  estimatedCompletion?: string;
}

export interface SyncQueueItem {
  id: string;
  table: string;
  action: "create" | "update" | "delete";
  data: any;
  priority: "high" | "medium" | "low";
  timestamp: number;
  retryCount: number;
  synced: boolean;
  error?: string;
}

export interface OfflineConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // in minutes
  retryAttempts: number;
  storageLimit: number; // in MB
}

export interface MobileAppState {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  offlineMode: boolean;
  syncInProgress: boolean;
}

export interface NetworkStatus {
  isOnline: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;
  rtt?: number;
}
