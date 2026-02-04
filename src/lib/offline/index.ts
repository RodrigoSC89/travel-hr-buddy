/**
 * Offline Module Index
 * Central export for offline utilities
 * PATCH 900: Enhanced resilience features
 * PATCH 901: Advanced offline-first with maritime optimizations
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

// PATCH 900: Advanced resilience features
export {
  resolveConflict,
  conflictStore,
  type ConflictStrategy,
  type ConflictResult,
} from './conflict-resolution';

export {
  compressPayload,
  decompressPayload,
  getCompressionStats,
  shouldCompress,
  type CompressedPayload,
} from './payload-compression';

export {
  circuits,
  circuitBreakerRegistry,
  protectedFetch,
  CircuitOpenError,
  type CircuitState,
  type CircuitStats,
} from './circuit-breaker';

export {
  getStorageQuota,
  getStorageBreakdown,
  isStorageLow,
  clearOldCaches,
  requestPersistence,
  storageMonitor,
  formatBytes,
  type StorageQuota,
} from './storage-quota';

// PATCH 901: Advanced features
export {
  requestBatcher,
  batchedFetch,
} from './request-batcher';

export {
  smartSync,
  initializeSmartSync,
  type SmartSyncConfig,
} from './smart-sync';

export {
  dataIntegrity,
  validateDataStructure,
  sanitizeForSync,
  type IntegrityCheck,
} from './data-integrity';

// PATCH 902: Maritime optimizations
export {
  optimizeImage,
  generateThumbnail,
  debounce,
  throttle,
  getPayloadSize,
  validatePayloadSize,
  loadImageProgressively,
  getConnectionInfo,
  getAdaptiveQualitySettings,
  cleanupStorageIfNeeded,
  type ImageOptimizationOptions,
  type ConnectionInfo,
  type QualitySettings,
  type ProgressiveImageState,
} from './optimizations';

// Database
export { db, initNautiOneDB, getDatabaseStats } from './db';

// Hooks
export { 
  useSyncStatus, 
  useOfflineStats, 
  useOfflineVessels, 
  useCreateOfflineVessel 
} from './hooks/useOfflineData';

// ===================================================================
// Initialize offline functionality
// ===================================================================

export async function initOfflineSupport() {
  console.log('🔌 Initializing Nauti One offline support...');

  // Register advanced service worker
  if ('serviceWorker' in navigator) {
    try {
      // Use advanced SW by default
      const swPath = '/sw-advanced.js';

      const registration = await navigator.serviceWorker.register(swPath, {
        scope: '/',
      });

      console.log(`✅ Service Worker registered: ${swPath}`);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New Service Worker available');
            }
          });
        }
      });

      // Listen for messages from SW
      navigator.serviceWorker.addEventListener('message', (event) => {
        const { type, ...data } = event.data || {};

        switch (type) {
          case 'SW_ACTIVATED':
            console.log(`✅ Service Worker activated: ${data.version}`);
            break;
          case 'BACKGROUND_SYNC':
            console.log('🔄 Background sync triggered by SW');
            window.dispatchEvent(new CustomEvent('offlineSync', { detail: data }));
            break;
        }
      });
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  // Initialize IndexedDB
  try {
    const { initNautiOneDB } = await import('./db');
    await initNautiOneDB();
    console.log('✅ IndexedDB initialized');
  } catch (error) {
    console.error('❌ IndexedDB initialization failed:', error);
  }

  // Setup online/offline listeners
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    window.dispatchEvent(new CustomEvent('connectionChange', { detail: { online: true } }));
  });

  window.addEventListener('offline', () => {
    console.log('📴 Connection lost');
    window.dispatchEvent(new CustomEvent('connectionChange', { detail: { online: false } }));
  });

  // Cleanup storage if needed
  try {
    const { cleanupStorageIfNeeded } = await import('./optimizations');
    await cleanupStorageIfNeeded(80);
  } catch (error) {
    console.warn('Storage cleanup skipped:', error);
  }

  console.log('✅ Nauti One offline support initialized');
}

// Utility to communicate with Service Worker
export function sendToServiceWorker(type: string, payload?: unknown): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (!navigator.serviceWorker.controller) {
      reject(new Error('No active Service Worker'));
      return;
    }

    const channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };

    navigator.serviceWorker.controller.postMessage(
      { type, payload },
      [channel.port2]
    );

    setTimeout(() => {
      reject(new Error('Service Worker response timeout'));
    }, 5000);
  });
}

// Get cache statistics
export async function getCacheStats(): Promise<Record<string, { name: string; entries: number }>> {
  try {
    return await sendToServiceWorker('GET_CACHE_STATS') as Record<string, { name: string; entries: number }>;
  } catch {
    return {};
  }
}

// Clear all caches
export async function clearAllCaches(): Promise<boolean> {
  try {
    await sendToServiceWorker('CLEAR_ALL_CACHES');
    return true;
  } catch {
    return false;
  }
}

// Prefetch URLs for offline access
export async function prefetchForOffline(urls: string[]): Promise<{ success: string[]; failed: Array<{ url: string; error: string }> }> {
  try {
    return await sendToServiceWorker('PREFETCH', { urls }) as { success: string[]; failed: Array<{ url: string; error: string }> };
  } catch {
    return { success: [], failed: urls.map(url => ({ url, error: 'SW not available' })) };
  }
}

// Health check
export async function checkServiceWorkerHealth(): Promise<{ healthy: boolean; version?: string }> {
  try {
    return await sendToServiceWorker('HEALTH_CHECK') as { healthy: boolean; version?: string };
  } catch {
    return { healthy: false };
  }
}
