/**
 * Conflict Resolution Strategy - PATCH 900
 * Handles data conflicts during offline sync with multiple strategies
 */

import { logger } from '@/lib/logger';

export type ConflictStrategy = 'server-wins' | 'client-wins' | 'last-write-wins' | 'merge' | 'manual';

export interface VersionedData {
  id: string;
  version: number;
  updatedAt: number;
  [key: string]: unknown;
}

export interface ConflictResult<T> {
  resolved: boolean;
  data: T;
  strategy: ConflictStrategy;
  conflicts?: string[];
}

export interface ConflictConfig {
  defaultStrategy: ConflictStrategy;
  fieldStrategies?: Record<string, ConflictStrategy>;
  onManualRequired?: (local: unknown, remote: unknown) => Promise<unknown>;
}

const DEFAULT_CONFIG: ConflictConfig = {
  defaultStrategy: 'last-write-wins',
};

/**
 * Resolve conflicts between local and remote data
 */
export function resolveConflict<T extends VersionedData>(
  local: T,
  remote: T,
  config: ConflictConfig = DEFAULT_CONFIG
): ConflictResult<T> {
  const strategy = config.defaultStrategy;
  
  logger.debug('[ConflictResolution] Resolving conflict', {
    localVersion: local.version,
    remoteVersion: remote.version,
    strategy,
  });

  switch (strategy) {
    case 'server-wins':
      return {
        resolved: true,
        data: remote,
        strategy,
      };

    case 'client-wins':
      return {
        resolved: true,
        data: { ...local, version: Math.max(local.version, remote.version) + 1 },
        strategy,
      };

    case 'last-write-wins':
      const winner = local.updatedAt > remote.updatedAt ? local : remote;
      return {
        resolved: true,
        data: { ...winner, version: Math.max(local.version, remote.version) + 1 },
        strategy,
      };

    case 'merge':
      return mergeData(local, remote, config);

    case 'manual':
      return {
        resolved: false,
        data: local,
        strategy,
        conflicts: detectConflicts(local, remote),
      };

    default:
      return {
        resolved: true,
        data: remote,
        strategy: 'server-wins',
      };
  }
}

/**
 * Merge data field by field using last-write-wins per field
 */
function mergeData<T extends VersionedData>(
  local: T,
  remote: T,
  config: ConflictConfig
): ConflictResult<T> {
  const merged: Record<string, unknown> = {};
  const conflicts: string[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    // Skip metadata fields
    if (['id', 'version', 'updatedAt', 'createdAt'].includes(key)) {
      continue;
    }

    const localValue = local[key];
    const remoteValue = remote[key];

    // No conflict if values are equal
    if (JSON.stringify(localValue) === JSON.stringify(remoteValue)) {
      merged[key] = localValue;
      continue;
    }

    // Get field-specific strategy or use default
    const fieldStrategy = config.fieldStrategies?.[key] || 'last-write-wins';

    switch (fieldStrategy) {
      case 'server-wins':
        merged[key] = remoteValue;
        break;
      case 'client-wins':
        merged[key] = localValue;
        break;
      case 'last-write-wins':
        merged[key] = local.updatedAt > remote.updatedAt ? localValue : remoteValue;
        break;
      case 'manual':
        conflicts.push(key);
        merged[key] = localValue; // Keep local until resolved
        break;
      default:
        merged[key] = remoteValue;
    }
  }

  return {
    resolved: conflicts.length === 0,
    data: {
      ...merged,
      id: local.id,
      version: Math.max(local.version, remote.version) + 1,
      updatedAt: Date.now(),
    } as T,
    strategy: 'merge',
    conflicts: conflicts.length > 0 ? conflicts : undefined,
  };
}

/**
 * Detect which fields have conflicts
 */
function detectConflicts<T extends VersionedData>(local: T, remote: T): string[] {
  const conflicts: string[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    if (['id', 'version', 'updatedAt', 'createdAt'].includes(key)) {
      continue;
    }

    if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
      conflicts.push(key);
    }
  }

  return conflicts;
}

/**
 * Create a version vector for CRDT-like operations
 */
export interface VersionVector {
  [nodeId: string]: number;
}

export function mergeVersionVectors(
  v1: VersionVector,
  v2: VersionVector
): VersionVector {
  const merged: VersionVector = { ...v1 };
  
  for (const [nodeId, version] of Object.entries(v2)) {
    merged[nodeId] = Math.max(merged[nodeId] || 0, version);
  }
  
  return merged;
}

/**
 * Check if v1 dominates v2 (all counters >= and at least one >)
 */
export function dominates(v1: VersionVector, v2: VersionVector): boolean {
  let hasGreater = false;
  
  for (const nodeId of new Set([...Object.keys(v1), ...Object.keys(v2)])) {
    const c1 = v1[nodeId] || 0;
    const c2 = v2[nodeId] || 0;
    
    if (c1 < c2) return false;
    if (c1 > c2) hasGreater = true;
  }
  
  return hasGreater;
}

/**
 * Check if two version vectors are concurrent (neither dominates)
 */
export function isConcurrent(v1: VersionVector, v2: VersionVector): boolean {
  return !dominates(v1, v2) && !dominates(v2, v1);
}

/**
 * Storage for conflict resolution metadata
 */
class ConflictStore {
  private conflicts: Map<string, { local: unknown; remote: unknown; detectedAt: number }> = new Map();

  add(id: string, local: unknown, remote: unknown): void {
    this.conflicts.set(id, {
      local,
      remote,
      detectedAt: Date.now(),
    });
    logger.warn('[ConflictStore] New conflict detected', { id });
  }

  get(id: string) {
    return this.conflicts.get(id);
  }

  resolve(id: string): void {
    this.conflicts.delete(id);
    logger.info('[ConflictStore] Conflict resolved', { id });
  }

  getPending(): string[] {
    return Array.from(this.conflicts.keys());
  }

  clear(): void {
    this.conflicts.clear();
  }
}

export const conflictStore = new ConflictStore();
