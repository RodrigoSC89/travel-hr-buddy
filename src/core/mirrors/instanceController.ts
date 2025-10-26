/**
 * PATCH 225 – Mirror Instance Controller
 * 
 * Orchestrates multiple Nautilus clones in the field and synchronizes their states.
 * Manages instance registry, sync status, and selective data push/pull operations.
 * 
 * @module InstanceController
 * @version 1.0.0
 */

import { Logger } from "@/lib/utils/logger";
import type { CloneRegistryEntry } from "../clones/cognitiveClone";



// Instance status
export type InstanceStatus = "active" | "inactive" | "syncing" | "error" | "offline" | "unknown";

// Sync priority
export type SyncPriority = "low" | "medium" | "high" | "critical";

// Data types for selective sync
export type DataType = 
  | "configuration"
  | "logs" 
  | "ai-models"
  | "telemetry"
  | "user-data"
  | "cache"
  | "all";

// Instance information
export interface InstanceInfo {
  id: string;
  name: string;
  version: string;
  status: InstanceStatus;
  location: "local" | "remote";
  endpoint?: string;
  lastSeen: string;
  lastSync: string;
  syncPercentage: number;
  capabilities: InstanceCapabilities;
  telemetry: InstanceTelemetry;
}

// Instance capabilities
export interface InstanceCapabilities {
  hasAI: boolean;
  hasDatabase: boolean;
  hasOfflineSupport: boolean;
  maxContextWindow: number;
  supportedModules: string[];
}

// Instance telemetry
export interface InstanceTelemetry {
  cpu: number; // percentage
  memory: number; // MB used
  storage: number; // MB used
  network: {
    latency: number; // ms
    bandwidth: number; // Mbps
    online: boolean;
  };
  uptime: number; // seconds
  requestCount: number;
  errorCount: number;
}

// Sync operation
export interface SyncOperation {
  id: string;
  instanceId: string;
  direction: "push" | "pull" | "bidirectional";
  dataTypes: DataType[];
  priority: SyncPriority;
  status: "pending" | "in-progress" | "completed" | "failed";
  progress: number; // 0-100
  startedAt?: string;
  completedAt?: string;
  error?: string;
  bytesTransferred: number;
  totalBytes: number;
}

// Sync log entry
export interface CloneSyncLog {
  id: string;
  timestamp: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  operation: "push" | "pull" | "sync";
  dataTypes: DataType[];
  success: boolean;
  duration: number; // ms
  bytesTransferred: number;
  errors: string[];
}

/**
 * InstanceController - Manages mirror instances and synchronization
 */
export class InstanceController {
  private instances: Map<string, InstanceInfo> = new Map();
  private syncOperations: Map<string, SyncOperation> = new Map();
  private syncLogs: CloneSyncLog[] = [];
  private maxLogSize = 1000;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor() {
    this.startHeartbeat();
  }

  /**
   * Register a new instance
   */
  registerInstance(info: InstanceInfo): void {
    Logger.info(`Registering instance: ${info.name} (${info.id})`);
    this.instances.set(info.id, info);
    
    // Update last seen
    info.lastSeen = new Date().toISOString();
  }

  /**
   * Unregister an instance
   */
  unregisterInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      Logger.info(`Unregistering instance: ${instance.name}`);
      this.instances.delete(instanceId);
    }
  }

  /**
   * Get instance by ID
   */
  getInstance(instanceId: string): InstanceInfo | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * List all instances
   */
  listInstances(filterStatus?: InstanceStatus): InstanceInfo[] {
    const instances = Array.from(this.instances.values());
    
    if (filterStatus) {
      return instances.filter(i => i.status === filterStatus);
    }
    
    return instances;
  }

  /**
   * Get active instances
   */
  getActiveInstances(): InstanceInfo[] {
    return this.listInstances("active");
  }

  /**
   * Update instance status
   */
  updateInstanceStatus(instanceId: string, status: InstanceStatus): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = status;
      instance.lastSeen = new Date().toISOString();
      Logger.debug(`Instance status updated: ${instanceId} -> ${status}`);
    }
  }

  /**
   * Update instance telemetry
   */
  updateTelemetry(instanceId: string, telemetry: Partial<InstanceTelemetry>): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.telemetry = { ...instance.telemetry, ...telemetry };
      instance.lastSeen = new Date().toISOString();
    }
  }

  /**
   * Get instance sync status
   */
  getSyncStatus(instanceId: string): {
    lastSync: string;
    syncPercentage: number;
    pendingOperations: number;
    recentLogs: CloneSyncLog[];
  } {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    const pendingOps = Array.from(this.syncOperations.values())
      .filter(op => op.instanceId === instanceId && op.status !== "completed");

    const recentLogs = this.syncLogs
      .filter(log => 
        log.sourceInstanceId === instanceId || 
        log.targetInstanceId === instanceId
      )
      .slice(-10);

    return {
      lastSync: instance.lastSync,
      syncPercentage: instance.syncPercentage,
      pendingOperations: pendingOps.length,
      recentLogs
    };
  }

  /**
   * Create a sync operation
   */
  async createSyncOperation(
    instanceId: string,
    direction: "push" | "pull" | "bidirectional",
    dataTypes: DataType[],
    priority: SyncPriority = "medium"
  ): Promise<string> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    const operationId = this.generateOperationId();
    const operation: SyncOperation = {
      id: operationId,
      instanceId,
      direction,
      dataTypes,
      priority,
      status: "pending",
      progress: 0,
      bytesTransferred: 0,
      totalBytes: 0
    };

    this.syncOperations.set(operationId, operation);
    Logger.info(`Sync operation created: ${operationId} for instance ${instanceId}`);

    // Start operation
    this.executeSyncOperation(operationId);

    return operationId;
  }

  /**
   * Execute a sync operation
   */
  private async executeSyncOperation(operationId: string): Promise<void> {
    const operation = this.syncOperations.get(operationId);
    if (!operation) {
      return;
    }

    const instance = this.instances.get(operation.instanceId);
    if (!instance) {
      operation.status = "failed";
      operation.error = "Instance not found";
      return;
    }

    operation.status = "in-progress";
    operation.startedAt = new Date().toISOString();
    instance.status = "syncing";

    const startTime = Date.now();

    try {
      Logger.info(`Starting sync operation: ${operationId}`);

      // Simulate sync process
      for (const dataType of operation.dataTypes) {
        await this.syncDataType(instance, dataType, operation);
      }

      operation.status = "completed";
      operation.completedAt = new Date().toISOString();
      operation.progress = 100;

      instance.lastSync = operation.completedAt;
      instance.syncPercentage = 100;
      instance.status = "active";

      const duration = Date.now() - startTime;

      // Log sync
      this.logSync({
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        sourceInstanceId: "local",
        targetInstanceId: operation.instanceId,
        operation: operation.direction === "bidirectional" ? "sync" : operation.direction,
        dataTypes: operation.dataTypes,
        success: true,
        duration,
        bytesTransferred: operation.bytesTransferred,
        errors: []
      });

      Logger.info(`Sync operation completed: ${operationId} in ${duration}ms`);
    } catch (error) {
      operation.status = "failed";
      operation.error = String(error);
      instance.status = "error";

      const duration = Date.now() - startTime;

      this.logSync({
        id: this.generateLogId(),
        timestamp: new Date().toISOString(),
        sourceInstanceId: "local",
        targetInstanceId: operation.instanceId,
        operation: operation.direction === "bidirectional" ? "sync" : operation.direction,
        dataTypes: operation.dataTypes,
        success: false,
        duration,
        bytesTransferred: operation.bytesTransferred,
        errors: [String(error)]
      });

      Logger.error(`Sync operation failed: ${operationId} - ${error}`);
    }
  }

  /**
   * Sync a specific data type
   */
  private async syncDataType(
    instance: InstanceInfo,
    dataType: DataType,
    operation: SyncOperation
  ): Promise<void> {
    Logger.debug(`Syncing ${dataType} for instance ${instance.id}`);

    // Simulate data transfer
    const dataSize = this.estimateDataSize(dataType);
    const chunkSize = 1024 * 100; // 100KB chunks
    let transferred = 0;

    while (transferred < dataSize) {
      await new Promise(resolve => setTimeout(resolve, 10));
      transferred += Math.min(chunkSize, dataSize - transferred);
      operation.bytesTransferred += Math.min(chunkSize, dataSize - transferred);
      operation.progress = Math.floor((operation.bytesTransferred / dataSize) * 100);
    }

    Logger.debug(`Synced ${dataType}: ${dataSize} bytes`);
  }

  /**
   * Estimate data size for a data type
   */
  private estimateDataSize(dataType: DataType): number {
    const sizes: Record<DataType, number> = {
      configuration: 10 * 1024, // 10KB
      logs: 100 * 1024, // 100KB
      "ai-models": 5 * 1024 * 1024, // 5MB
      telemetry: 50 * 1024, // 50KB
      "user-data": 500 * 1024, // 500KB
      cache: 1024 * 1024, // 1MB
      all: 10 * 1024 * 1024 // 10MB
    };

    return sizes[dataType] || 0;
  }

  /**
   * Force push data to instance
   */
  async forcePush(instanceId: string, dataTypes: DataType[]): Promise<string> {
    Logger.info(`Force pushing data to instance: ${instanceId}`);
    return this.createSyncOperation(instanceId, "push", dataTypes, "high");
  }

  /**
   * Force pull data from instance
   */
  async forcePull(instanceId: string, dataTypes: DataType[]): Promise<string> {
    Logger.info(`Force pulling data from instance: ${instanceId}`);
    return this.createSyncOperation(instanceId, "pull", dataTypes, "high");
  }

  /**
   * Get sync operation status
   */
  getSyncOperation(operationId: string): SyncOperation | undefined {
    return this.syncOperations.get(operationId);
  }

  /**
   * List sync operations
   */
  listSyncOperations(instanceId?: string): SyncOperation[] {
    const operations = Array.from(this.syncOperations.values());
    
    if (instanceId) {
      return operations.filter(op => op.instanceId === instanceId);
    }
    
    return operations;
  }

  /**
   * Cancel sync operation
   */
  cancelSyncOperation(operationId: string): void {
    const operation = this.syncOperations.get(operationId);
    if (operation && operation.status === "in-progress") {
      operation.status = "failed";
      operation.error = "Cancelled by user";
      Logger.info(`Sync operation cancelled: ${operationId}`);
    }
  }

  /**
   * Get sync logs
   */
  getSyncLogs(instanceId?: string, limit: number = 100): CloneSyncLog[] {
    let logs = [...this.syncLogs];
    
    if (instanceId) {
      logs = logs.filter(log => 
        log.sourceInstanceId === instanceId || 
        log.targetInstanceId === instanceId
      );
    }
    
    return logs.slice(-limit);
  }

  /**
   * Log sync operation
   */
  private logSync(log: CloneSyncLog): void {
    this.syncLogs.push(log);
    
    if (this.syncLogs.length > this.maxLogSize) {
      this.syncLogs.shift();
    }
  }

  /**
   * Get system overview
   */
  getSystemOverview(): {
    totalInstances: number;
    activeInstances: number;
    syncingInstances: number;
    offlineInstances: number;
    pendingOperations: number;
    completedOperations: number;
    averageSyncPercentage: number;
  } {
    const instances = Array.from(this.instances.values());
    const operations = Array.from(this.syncOperations.values());

    return {
      totalInstances: instances.length,
      activeInstances: instances.filter(i => i.status === "active").length,
      syncingInstances: instances.filter(i => i.status === "syncing").length,
      offlineInstances: instances.filter(i => i.status === "offline").length,
      pendingOperations: operations.filter(op => op.status === "pending" || op.status === "in-progress").length,
      completedOperations: operations.filter(op => op.status === "completed").length,
      averageSyncPercentage: instances.length > 0
        ? instances.reduce((sum, i) => sum + i.syncPercentage, 0) / instances.length
        : 0
    };
  }

  /**
   * Start heartbeat monitoring
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.checkInstanceHealth();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check instance health
   */
  private checkInstanceHealth(): void {
    const now = Date.now();
    const timeout = 60000; // 1 minute timeout

    for (const [id, instance] of this.instances) {
      const lastSeen = new Date(instance.lastSeen).getTime();
      const timeSinceLastSeen = now - lastSeen;

      if (timeSinceLastSeen > timeout && instance.status !== "offline") {
        Logger.warn(`Instance ${id} appears offline (last seen ${timeSinceLastSeen}ms ago)`);
        instance.status = "offline";
      }
    }
  }

  /**
   * Stop heartbeat monitoring
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Export sync logs
   */
  exportLogs(): Blob {
    const data = JSON.stringify(this.syncLogs, null, 2);
    return new Blob([data], { type: "application/json" });
  }

  /**
   * Clear sync logs
   */
  clearLogs(): void {
    this.syncLogs = [];
    Logger.info('Sync logs cleared');
  }

  /**
   * Generate unique operation ID
   */
  private generateOperationId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate unique log ID
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopHeartbeat();
    this.instances.clear();
    this.syncOperations.clear();
    this.syncLogs = [];
  }
}

// Singleton instance
export const instanceController = new InstanceController();

// Export convenience functions

/**
 * Quick sync all data to instance
 */
export async function syncAll(instanceId: string): Promise<string> {
  return instanceController.createSyncOperation(instanceId, "bidirectional", ["all"], "high");
}

/**
 * Quick push telemetry to instance
 */
export async function pushTelemetry(instanceId: string): Promise<string> {
  return instanceController.forcePush(instanceId, ["telemetry"]);
}

/**
 * Quick pull logs from instance
 */
export async function pullLogs(instanceId: string): Promise<string> {
  return instanceController.forcePull(instanceId, ["logs"]);
}
