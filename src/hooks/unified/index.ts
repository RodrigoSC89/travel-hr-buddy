/**
 * PATCH 178.0 - Unified Hooks Index
 * Centralized exports for all unified hooks
 */

// Network & Connection
export { 
  useNetwork, 
  useNetworkStatus, 
  useConnectionAware, 
  useConnectionAdaptive,
  useLightMode,
  useAdaptiveDebounce,
  useAdaptivePolling,
  type NetworkStatus,
  type ConnectionQuality,
  type AdaptiveSettings,
} from './useNetwork';

// User Profile
export { 
  useUserProfile, 
  useProfile,
  type UserProfile,
} from './useUserProfile';

// Performance
export { 
  usePerformanceMetrics, 
  usePerformance,
  usePerformanceMonitor,
  useRenderPerformance,
  getPerformanceSnapshot,
  type PerformanceMetrics,
  type WebVitals,
  type MemoryInfo,
  type PerformanceEvaluation,
} from './usePerformanceMetrics';

// Offline Support
export { 
  useOfflineMutation, 
  useOfflineData,
  usePendingActionsCount,
  useOfflineStorage,
  offlineQueue,
  type OfflineMutationOptions,
  type OfflineDataOptions,
} from './useOffline';
