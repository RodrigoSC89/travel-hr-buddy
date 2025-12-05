/**
 * PWA Utilities Index
 * PATCH 850: Enhanced PWA functionality with offline sync
 */

export { swManager, usePWA } from './service-worker-registration';
export { offlineSync, useOfflineSync } from './offline-sync';
export { smartCache, useSmartCache } from './smart-cache';
export { serviceWorkerManager, useServiceWorker } from './service-worker-manager';

// PATCH 850: Advanced offline sync manager
export { offlineSyncManager } from './offline-sync-manager';
export { SW_VERSION, CACHE_NAMES, CACHE_STRATEGIES, SYNC_CONFIG, NETWORK_TIMEOUTS } from './service-worker-config';
