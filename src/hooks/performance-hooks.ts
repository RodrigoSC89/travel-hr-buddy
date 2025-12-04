/**
 * Performance Hooks Index
 * Central export for all performance-related hooks
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
