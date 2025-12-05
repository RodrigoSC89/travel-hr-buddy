/**
 * Centralized exports for all application hooks
 * 
 * This file provides a single import point for all custom hooks,
 * making it easier to import and use them throughout the application.
 * 
 * @example
 * import { useUsers, useEnhancedNotifications, useMaritimeChecklists } from '@/hooks';
 */

// User Management
export { useUsers } from "./use-users";
export type { UserWithRole } from "./use-users";

// Notifications
export { useEnhancedNotifications } from "./use-enhanced-notifications";
export type { Notification } from "./use-enhanced-notifications";

// Maritime Operations
export { useMaritimeChecklists } from "./use-maritime-checklists";

// Authentication & Permissions
export { useAuth } from "@/contexts/AuthContext";
export { usePermissions } from "./use-permissions";
export { useOrganizationPermissions } from "./use-organization-permissions";
export type { UserRole, Permission } from "./use-permissions";

// UI & UX
export { useToast } from "./use-toast";
export { useIsMobile } from "./use-mobile";
export { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
export { useFocusTrap } from "./use-focus-trap";
export { useArrowNavigation } from "./use-arrow-navigation";

// System & Operations
export { useOfflineStorage } from "./use-offline-storage";
export { useAPIHealth } from "./use-api-health";
export { useRestoreLogsSummary } from "./use-restore-logs-summary";
export { useRestoreLogsMetrics } from "./use-restore-logs-metrics";

// Business Logic
export { useProfile } from "./use-profile";
export { useAuthProfile } from "./use-auth-profile";
export { useExpenses } from "./useExpenses";
export { default as useModules } from "./useModules";
export { useMaritimeActions } from "./useMaritimeActions";
export { useButtonHandlers } from "./useButtonHandlers";
export { useFormActions } from "./use-form-actions";
export { useSidebarActions } from "./use-sidebar-actions";
export { useSystemActions } from "./use-system-actions";
export { useNavigationManager } from "./use-navigation-manager";
export { useBreadcrumbs } from "./use-breadcrumbs";

// Specialized Features
export { useTrainingModules } from "./use-training-modules";
export { useTravelPredictions } from "./use-travel-predictions";
export { useVoiceNavigation } from "./use-voice-navigation";
export { useServiceIntegrations } from "./use-service-integrations";

// PATCH 800: Performance & Offline Hooks
export { useDebouncedValue, useDebouncedCallback, useThrottledCallback } from "./use-debounced-value";
export { useNetworkStatus, useAdaptiveSettings, type ConnectionQuality } from "./use-network-status";
export { useVirtualList, useInfiniteScroll } from "./use-virtual-list";
export { useOfflineMutation } from "./use-offline-mutation";

// PATCH 810: Optimized Data Fetching
export { useOptimizedQuery, useOptimizedMutation, useInfiniteOptimizedQuery } from "./use-optimized-query";

// PATCH 815: Adaptive Performance
export { 
  useAdaptivePerformance, 
  useThrottledRealtime, 
  useAdaptivePolling,
  useFeatureFlags,
  type PerformanceConfig 
} from "./use-adaptive-performance";

// PATCH 820: Intersection-based Preloading
export { 
  useIntersectionPreload, 
  useHoverPreload, 
  useProgressiveImage 
} from "./use-intersection-preload";

// PATCH 831: Performance utilities
export { useOfflineSync } from "@/lib/performance/offline-sync";
export { 
  useOptimisticUpdate, 
  useOptimisticList, 
  useDebouncedOptimisticUpdate 
} from "@/lib/performance/optimistic-updates";
export { 
  useDebouncedInput, 
  useValidatedField, 
  useOptimizedForm, 
  useAutoSave 
} from "@/lib/performance/form-optimization";
export { 
  useConnection, 
  useAdaptiveFetch 
} from "@/components/performance/ConnectionAware";
export { useVirtualizedData } from "@/components/performance/VirtualizedList";

// PATCH 832: Advanced utilities
export { useRequestQueue } from "@/lib/performance/request-queue-manager";
export { useCachedFetch } from "@/lib/performance/api-cache-layer";
export { useErrorBoundary } from "@/components/performance/ErrorBoundaryAdvanced";

// PATCH 833: PWA & System utilities
export { usePWA } from "@/lib/pwa/service-worker-registration";
export { useWebVitals } from "@/lib/performance/web-vitals-monitor";
export { useAPI, useSupabaseQuery } from "@/lib/api/unified-api-client";
export { useSystemConfig } from "@/lib/system/system-config";
export { useRealtimeSubscription, useRealtimeConnectionStatus } from "@/lib/realtime/realtime-manager";
export { useAnalytics } from "@/lib/analytics/analytics-client";
export { useErrorTracking } from "@/lib/error-tracking/error-tracker";

// PATCH 834: Low bandwidth optimizations
export { useBandwidthOptimizer } from "@/lib/performance/low-bandwidth-optimizer";
export { useOptimizedFetch } from "@/lib/performance/request-optimizer";
export { useSlowConnectionWarning } from "@/components/performance/ConnectionIndicator";

// PATCH 835: Advanced performance utilities
export { useNetworkStatus as useNetworkMonitor, useNetworkAware } from "@/lib/performance/network-monitor";
export { useVirtualScroll, useInfiniteScroll as useInfiniteScrollAdvanced, useWindowedData } from "@/lib/performance/virtual-scroll";
export { useCompressedFetch } from "@/lib/performance/data-compressor";
