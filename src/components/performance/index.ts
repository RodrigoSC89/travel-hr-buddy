/**
 * Performance Components Index
 * Cleaned: Only active components remain
 */

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

// Optimized image
export { OptimizedImage, OptimizedAvatar } from './OptimizedImage';
