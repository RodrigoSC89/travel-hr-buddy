/**
 * PATCH 548 - Instance Controller Service
 * Refactored service for managing mirror instances
 */

export type InstanceStatus = "active" | "inactive" | "syncing" | "error" | "offline";
export type SyncDirection = "pull" | "push" | "bidirectional";
export type DataCategory = "config" | "ai_memory" | "logs" | "user_data" | "all";

export interface MirrorInstance {
  id: string;
  name: string;
  endpoint: string;
  status: InstanceStatus;
  lastSeen: Date;
  syncStatus: {
    percentage: number;
    lastSync: Date;
    nextSync?: Date;
    inProgress: boolean;
  };
  capabilities: string[];
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  metrics: {
    latency: number;
    uptime: number;
    memoryUsage: number;
    storageUsage: number;
  };
  version: string;
  parentInstanceId?: string;
}

export interface SyncOperation {
  id: string;
  sourceInstanceId: string;
  targetInstanceId: string;
  direction: SyncDirection;
  dataCategories: DataCategory[];
  status: "pending" | "in_progress" | "completed" | "failed";
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  itemsSynced: number;
  totalItems: number;
}

export class InstanceControllerService {
  private static instances = new Map<string, MirrorInstance>();
  private static syncOperations = new Map<string, SyncOperation>();

  /**
   * Register a new mirror instance
   */
  static registerInstance(
    name: string,
    endpoint: string,
    capabilities: string[],
    location?: { latitude: number; longitude: number; name: string }
  ): MirrorInstance {
    console.info(`[InstanceController] Registering instance: ${name}`);

    const instance: MirrorInstance = {
      id: this.generateId(),
      name,
      endpoint,
      status: "active",
      lastSeen: new Date(),
      syncStatus: {
        percentage: 0,
        lastSync: new Date(),
        inProgress: false,
      },
      capabilities,
      location,
      metrics: {
        latency: 0,
        uptime: 0,
        memoryUsage: 0,
        storageUsage: 0,
      },
      version: "1.0.0",
      parentInstanceId: this.getMainInstanceId(),
    };

    this.instances.set(instance.id, instance);
    console.info(`[InstanceController] Instance registered: ${instance.id}`);
    return instance;
  }

  /**
   * List all instances
   */
  static listInstances(filter?: { status?: InstanceStatus }): MirrorInstance[] {
    let instances = Array.from(this.instances.values());

    if (filter?.status) {
      instances = instances.filter(i => i.status === filter.status);
    }

    return instances;
  }

  /**
   * Get instance by ID
   */
  static getInstance(instanceId: string): MirrorInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Update instance status
   */
  static updateInstanceStatus(instanceId: string, status: InstanceStatus): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Instance not found: ${instanceId}`);
    }

    instance.status = status;
    instance.lastSeen = new Date();
    console.info(`[InstanceController] Instance ${instanceId} status: ${status}`);
  }

  /**
   * Create sync operation
   */
  static createSyncOperation(
    sourceId: string,
    targetId: string,
    direction: SyncDirection,
    dataCategories: DataCategory[]
  ): SyncOperation {
    const operation: SyncOperation = {
      id: this.generateId(),
      sourceInstanceId: sourceId,
      targetInstanceId: targetId,
      direction,
      dataCategories,
      status: "pending",
      progress: 0,
      itemsSynced: 0,
      totalItems: 0,
    };

    this.syncOperations.set(operation.id, operation);
    return operation;
  }

  // Private helper methods

  private static generateId(): string {
    return `inst_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getMainInstanceId(): string {
    return localStorage.getItem("instance_id") || "main-instance";
  }
}

export const instanceControllerService = InstanceControllerService;
