/**
 * PATCH 200.0 - Nautilus One Mobile App - Complete Export
 * Full mobile optimization suite with offline-first architecture
 */

// ============================================
// CORE SERVICES
// ============================================
export { sqliteStorage } from "./services/sqlite-storage";
export { syncQueue } from "./services/syncQueue";
export { networkDetector } from "./services/networkDetector";
export { EnhancedSyncEngine, enhancedSyncEngine } from "./services/enhanced-sync-engine";
export { backgroundSyncService } from "./services/background-sync";
export { dataCompression } from "./services/data-compression";
export { BiometricAuthService, biometricAuthService } from "./services/biometric-auth";

// ============================================
// OPTIMIZATION HOOKS
// ============================================
export { useVirtualizedList, useInfiniteVirtualList } from "./hooks/useVirtualizedList";
export { useWorker, useWorkerSort, useWorkerFilter, useWorkerSearch } from "./hooks/useWorker";
export { 
  useRuntimeOptimization, 
  useMemoryPressure, 
  useMemoryCleanup,
  useDeferredRender,
  useVisibleRender,
  useBatchedUpdates,
  useLayoutContainment,
  useDebounce,
  useThrottle,
  useOptimizedScroll,
} from "./hooks/useRuntimeOptimization";
export { useAdaptivePolling } from "./hooks/useAdaptivePolling";
export { useMobileOptimization } from "./hooks/useMobileOptimization";
export { useOfflineSync, useTableSync } from "./hooks/useOfflineSync";
export { usePerformanceMonitor, PerformanceOverlay } from "./hooks/usePerformanceMonitor";
export { usePushNotifications } from "./hooks/usePushNotifications";
export { useNetworkAware } from "./hooks/useNetworkAware";
export { useSyncManager } from "./hooks/useSyncManager";

// ============================================
// OPTIMIZED COMPONENTS
// ============================================
export { VirtualizedList, VirtualizedGrid } from "./components/VirtualizedList";
export { NetworkAwareImage } from "./components/NetworkAwareImage";
export { OfflineIndicator } from "./components/OfflineIndicator";
export { MobileLayout } from "./components/MobileLayout";
export { OfflineChecklist } from "./components/OfflineChecklist";
export { MissionDashboardComponent } from "./components/MissionDashboard";
export { VoiceInterface } from "./components/VoiceInterface";

// ============================================
// PROVIDERS
// ============================================
export { OfflineDataProvider, useOfflineData, useOfflineTable } from "./providers/OfflineDataProvider";

// ============================================
// SCREENS
// ============================================
export { MobileHome, MobileMissions, MobileLogs } from "./screens";

// ============================================
// AI FEATURES
// ============================================
export { mobileAICore } from "./ai";
export { localMemory } from "./ai/localMemory";
export { intentParser } from "./ai/intentParser";
export type { Intent } from "./ai/intentParser";

// ============================================
// TYPES
// ============================================
export type { 
  MobileChecklist, 
  ChecklistItem,
  MissionDashboard,
  SyncQueueItem,
  OfflineConfig,
  MobileAppState,
  NetworkStatus,
} from "./types";

export type { 
  PushNotificationState,
  PushNotificationOptions,
} from "./hooks/usePushNotifications";

export type {
  NetworkQuality,
  NetworkAwareState,
  NetworkAwareOptions,
} from "./hooks/useNetworkAware";
