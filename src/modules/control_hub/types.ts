export interface HubConfig {
  syncInterval: number;
  cacheSizeLimit: number;
  retryAttempts: number;
  healthCheckInterval: number;
  connectionTimeout: number;
  featureFlags: {
    offlineCache: boolean;
    realtimeSync: boolean;
    autoRecovery: boolean;
    encryptedLogs: boolean;
  };
  modules: {
    [key: string]: {
      name: string;
      enabled: boolean;
      priority: number;
    };
  };
}

export interface ModuleStatus {
  name: string;
  status: 'OK' | 'Em verificação' | 'Auditoria OK' | 'Desvio detectado' | 'Online' | 'Offline' | 'Error';
  uptime?: number;
  errors?: number;
  lastCheck?: Date;
  performance?: number;
}

export interface CacheEntry {
  id: string;
  data: any;
  timestamp: Date;
  synchronized: boolean;
  module: string;
}

export interface SyncResult {
  success: boolean;
  recordsSent: number;
  errors: string[];
  timestamp: Date;
}

export interface HubState {
  isOnline: boolean;
  pendingRecords: number;
  lastSync?: Date;
  cacheSize: number;
  modules: Record<string, ModuleStatus>;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  modules: ModuleStatus[];
  cache: {
    size: number;
    pending: number;
    capacity: number;
  };
  connectivity: {
    online: boolean;
    quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
    lastSync?: Date;
  };
}

export interface BridgeLinkConnection {
  isConnected: boolean;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  lastPing?: Date;
  latency?: number;
}
