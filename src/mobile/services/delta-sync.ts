/**
 * PATCH 589 - Delta Sync Service
 * Implements efficient delta synchronization to minimize bandwidth
 */

import { structuredLogger } from "@/lib/logger/structured-logger";
import { compressionService } from "./compression-service";

export interface DeltaChange {
  path: string;
  operation: "add" | "remove" | "replace";
  value?: any;
  oldValue?: any;
}

export interface DeltaPacket {
  baseVersion: string;
  targetVersion: string;
  changes: DeltaChange[];
  timestamp: number;
  checksum: string;
}

export interface SyncState {
  version: string;
  lastSync: number;
  data: Record<string, any>;
}

/**
 * Delta Sync Service
 * Tracks changes and generates minimal sync payloads
 */
class DeltaSyncService {
  private readonly STORAGE_KEY = "nautilus_delta_state";
  private localState: Map<string, SyncState> = new Map();

  constructor() {
    this.loadState();
  }

  /**
   * Load state from storage
   */
  private loadState(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.localState = new Map(Object.entries(parsed));
      }
    } catch (error) {
      structuredLogger.error("Failed to load delta state", error as Error);
    }
  }

  /**
   * Save state to storage
   */
  private saveState(): void {
    try {
      const obj = Object.fromEntries(this.localState);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(obj));
    } catch (error) {
      structuredLogger.error("Failed to save delta state", error as Error);
    }
  }

  /**
   * Calculate diff between two objects
   */
  calculateDiff(
    oldData: Record<string, any>,
    newData: Record<string, any>,
    path: string = ""
  ): DeltaChange[] {
    const changes: DeltaChange[] = [];

    // Check for removed keys
    for (const key of Object.keys(oldData)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!(key in newData)) {
        changes.push({
          path: currentPath,
          operation: "remove",
          oldValue: oldData[key]
        });
      }
    }

    // Check for added or changed keys
    for (const key of Object.keys(newData)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (!(key in oldData)) {
        changes.push({
          path: currentPath,
          operation: "add",
          value: newData[key]
        });
      } else if (typeof oldData[key] === "object" && typeof newData[key] === "object") {
        // Recursively diff objects
        if (Array.isArray(oldData[key]) && Array.isArray(newData[key])) {
          // For arrays, use simple comparison
          if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            changes.push({
              path: currentPath,
              operation: "replace",
              value: newData[key],
              oldValue: oldData[key]
            });
          }
        } else if (oldData[key] !== null && newData[key] !== null) {
          changes.push(...this.calculateDiff(oldData[key], newData[key], currentPath));
        } else if (oldData[key] !== newData[key]) {
          changes.push({
            path: currentPath,
            operation: "replace",
            value: newData[key],
            oldValue: oldData[key]
          });
        }
      } else if (oldData[key] !== newData[key]) {
        changes.push({
          path: currentPath,
          operation: "replace",
          value: newData[key],
          oldValue: oldData[key]
        });
      }
    }

    return changes;
  }

  /**
   * Apply delta changes to data
   */
  applyDelta(data: Record<string, any>, changes: DeltaChange[]): Record<string, any> {
    const result = { ...data };

    for (const change of changes) {
      const pathParts = change.path.split(".");
      let current: any = result;

      // Navigate to parent
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!(pathParts[i] in current)) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }

      const lastKey = pathParts[pathParts.length - 1];

      switch (change.operation) {
      case "add":
      case "replace":
        current[lastKey] = change.value;
        break;
      case "remove":
        delete current[lastKey];
        break;
      }
    }

    return result;
  }

  /**
   * Create a delta packet for sync
   */
  async createDeltaPacket(
    entityType: string,
    newData: Record<string, any>
  ): Promise<DeltaPacket | null> {
    const state = this.localState.get(entityType);
    
    if (!state) {
      // No previous state, need full sync
      return null;
    }

    const changes = this.calculateDiff(state.data, newData);

    if (changes.length === 0) {
      // No changes
      return null;
    }

    const newVersion = this.generateVersion();
    
    const packet: DeltaPacket = {
      baseVersion: state.version,
      targetVersion: newVersion,
      changes,
      timestamp: Date.now(),
      checksum: await this.calculateChecksum(newData)
    };

    // Update local state
    this.localState.set(entityType, {
      version: newVersion,
      lastSync: Date.now(),
      data: newData
    });
    this.saveState();

    structuredLogger.info("Delta packet created", {
      entityType,
      changeCount: changes.length,
      fullSize: JSON.stringify(newData).length,
      deltaSize: JSON.stringify(packet).length
    });

    return packet;
  }

  /**
   * Process incoming delta packet
   */
  async processDeltaPacket(
    entityType: string,
    packet: DeltaPacket
  ): Promise<Record<string, any> | null> {
    const state = this.localState.get(entityType);

    if (!state || state.version !== packet.baseVersion) {
      // Version mismatch, need full sync
      structuredLogger.warn("Delta version mismatch, need full sync", {
        entityType,
        localVersion: state?.version,
        packetBase: packet.baseVersion
      });
      return null;
    }

    const newData = this.applyDelta(state.data, packet.changes);
    const checksum = await this.calculateChecksum(newData);

    if (checksum !== packet.checksum) {
      // Checksum mismatch
      structuredLogger.error("Delta checksum mismatch", {
        entityType,
        expected: packet.checksum,
        actual: checksum
      });
      return null;
    }

    // Update local state
    this.localState.set(entityType, {
      version: packet.targetVersion,
      lastSync: Date.now(),
      data: newData
    });
    this.saveState();

    return newData;
  }

  /**
   * Set initial state for an entity type
   */
  setInitialState(entityType: string, data: Record<string, any>): void {
    this.localState.set(entityType, {
      version: this.generateVersion(),
      lastSync: Date.now(),
      data
    });
    this.saveState();
  }

  /**
   * Get current version for an entity type
   */
  getVersion(entityType: string): string | null {
    return this.localState.get(entityType)?.version || null;
  }

  /**
   * Get last sync time for an entity type
   */
  getLastSync(entityType: string): number | null {
    return this.localState.get(entityType)?.lastSync || null;
  }

  /**
   * Generate a unique version string
   */
  private generateVersion(): string {
    return `v${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calculate checksum for data integrity
   */
  private async calculateChecksum(data: Record<string, any>): Promise<string> {
    const str = JSON.stringify(data);
    
    // Use SubtleCrypto if available
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(str);
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // Simple fallback checksum
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Get sync statistics
   */
  getStats(): {
    entityTypes: string[];
    totalSize: number;
    oldestSync: number | null;
  } {
    const entityTypes = Array.from(this.localState.keys());
    let totalSize = 0;
    let oldestSync: number | null = null;

    for (const state of this.localState.values()) {
      totalSize += JSON.stringify(state.data).length;
      if (!oldestSync || state.lastSync < oldestSync) {
        oldestSync = state.lastSync;
      }
    }

    return { entityTypes, totalSize, oldestSync };
  }

  /**
   * Clear all delta state
   */
  clear(): void {
    this.localState.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const deltaSyncService = new DeltaSyncService();
