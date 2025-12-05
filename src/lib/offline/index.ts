/**
 * Offline Module Index
 * Central export for offline utilities
 */

export { requestQueue } from './request-queue';
export { offlineSyncManager, initializeSyncManager } from './sync-manager';
export { 
  queueAction, 
  getPendingActions, 
  removeAction, 
  incrementRetry,
  cacheData,
  getCachedData,
  clearExpiredCache,
  getQueueStats 
} from './sync-queue';

// PATCH 850: Connection resilience
export { 
  connectionResilience, 
  type ConnectionState, 
  type RetryConfig 
} from './connection-resilience';
