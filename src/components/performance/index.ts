/**
 * Performance Components Index
 * PATCH 835: Central export for all performance components
 */

// Data loading
export { DataLoader, SuspenseLoader, InlineLoader } from './DataLoader';

// Connection awareness
export { ConnectionIndicator, ConnectionBadge, useSlowConnectionWarning } from './ConnectionIndicator';

// Performance monitoring
export { PerformanceMonitor, DevPerformanceOverlay } from './PerformanceMonitor';

// Main wrapper
export { 
  PerformanceWrapper, 
  withPerformance, 
  PerformanceProvider, 
  usePerformanceContext 
} from './PerformanceWrapper';

// Virtualized list
export { VirtualizedList, useVirtualizedData } from './VirtualizedList';

// Error boundary
export { ErrorBoundaryAdvanced, useErrorBoundary } from './ErrorBoundaryAdvanced';

// Connection aware
export { 
  ConnectionProvider, 
  useConnection, 
  ConnectionConditional,
  withConnectionAware,
  useAdaptiveFetch 
} from './ConnectionAware';

// Optimized image (re-export from lib)
export { OptimizedImage, OptimizedAvatar } from './OptimizedImage';

// Bandwidth indicator
export { BandwidthIndicator, BandwidthBadge } from './BandwidthIndicator';

// Skeleton loaders
export { 
  Skeleton, 
  SkeletonCard, 
  SkeletonTable, 
  SkeletonDashboard, 
  SkeletonList 
} from './SkeletonLoader';

// Network status
export { NetworkStatusIndicator } from './NetworkStatusIndicator';

// Resilience indicator (PATCH 900)
export { ResilienceIndicator, ResilienceBadge } from './ResilienceIndicator';

