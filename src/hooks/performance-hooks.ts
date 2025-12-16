/**
 * Hooks Index
 * Central export for all custom hooks
 */

// Connection awareness
export { 
  useConnectionAware, 
  useAdaptivePolling, 
  useLazyLoad 
} from './use-connection-aware';

// Offline support
export { 
  useOfflineMutation, 
  useOfflineData, 
  usePendingActionsCount 
} from './use-offline-support';

// Optimistic updates
export { 
  useOptimisticUpdate, 
  useOptimisticToggle, 
  useOptimisticList 
} from './use-optimistic-update';

// System health
export { useSystemHealth } from './use-system-health';

// Keyboard shortcuts
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';

// Form management
export { useForm, createChangeHandler } from './use-form';

// Confirmation dialogs
export { useConfirmation, ConfirmationDialog } from './use-confirmation';

// Analytics
export { useAnalytics, trackEvent, trackPerformance } from './use-analytics';
export type { AnalyticsEvent, AnalyticsEventType } from './use-analytics';

// Connection Speed Detection - PATCH 753
export { useConnectionSpeed, useAdaptiveLoading } from './useConnectionSpeed';
export type { ConnectionQuality } from './useConnectionSpeed';
