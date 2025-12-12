/**
 * Offline Module Index
 * Central export for offline utilities
 * PATCH 900: Enhanced resilience features
 */

export { requestQueue } from "./request-queue";
export { offlineSyncManager, initializeSyncManager } from "./sync-manager";
export { 
  queueAction, 
  getPendingActions, 
  removeAction, 
  incrementRetry,
  cacheData,
  getCachedData,
  clearExpiredCache,
  getQueueStats 
} from "./sync-queue";

// PATCH 850: Connection resilience
export { 
  connectionResilience, 
  type ConnectionState, 
  type RetryConfig 
} from "./connection-resilience";

// PATCH 900: Advanced resilience features
export {
  resolveConflict,
  conflictStore,
  type ConflictStrategy,
  type ConflictResult,
} from "./conflict-resolution";

export {
  compressPayload,
  decompressPayload,
  getCompressionStats,
  shouldCompress,
  type CompressedPayload,
} from "./payload-compression";

export {
  circuits,
  circuitBreakerRegistry,
  protectedFetch,
  CircuitOpenError,
  type CircuitState,
  type CircuitStats,
} from "./circuit-breaker";

export {
  getStorageQuota,
  getStorageBreakdown,
  isStorageLow,
  clearOldCaches,
  requestPersistence,
  storageMonitor,
  formatBytes,
  type StorageQuota,
} from "./storage-quota";

// PATCH 901: Advanced features
export {
  requestBatcher,
  batchedFetch,
} from "./request-batcher";

export {
  smartSync,
  initializeSmartSync,
  type SmartSyncConfig,
} from "./smart-sync";

export {
  dataIntegrity,
  validateDataStructure,
  sanitizeForSync,
  type IntegrityCheck,
} from "./data-integrity";
