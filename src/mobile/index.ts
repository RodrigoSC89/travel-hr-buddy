/**
 * PATCH 190.0 - Nautilus One Mobile App - Main Export
 * Complete mobile optimization suite
 */

// Core Services
export { sqliteStorage } from "./services/sqlite-storage";
export { syncQueue } from "./services/syncQueue";
export { networkDetector } from "./services/networkDetector";
export { EnhancedSyncEngine, enhancedSyncEngine } from "./services/enhanced-sync-engine";

// Optimization Hooks
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

// Optimized Components
export { VirtualizedList, VirtualizedGrid } from "./components/VirtualizedList";
export { NetworkAwareImage } from "./components/NetworkAwareImage";
export { OfflineIndicator } from "./components/OfflineIndicator";

// Providers
export { OfflineDataProvider, useOfflineData, useOfflineTable } from "./providers/OfflineDataProvider";

// Types
export type { 
  MobileChecklist, 
  ChecklistItem,
  MissionDashboard,
  SyncQueueItem,
  OfflineConfig,
  MobileAppState,
  NetworkStatus,
} from "./types";

// Legacy exports for backwards compatibility
export { OfflineChecklist } from "./components/OfflineChecklist";
export { MissionDashboardComponent } from "./components/MissionDashboard";
export { useSyncManager } from "./hooks/useSyncManager";
export { mobileAICore } from "./ai";
export { localMemory } from "./ai/localMemory";
export { intentParser } from "./ai/intentParser";
export { VoiceInterface } from "./components/VoiceInterface";
export type { Intent } from "./ai/intentParser";
export { BiometricAuthService, biometricAuthService } from "./services/biometric-auth";
export { MobileHome, MobileMissions, MobileLogs } from "./screens";
