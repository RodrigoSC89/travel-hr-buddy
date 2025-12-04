/**
 * UI Components Performance Exports
 * Central export for all UI components
 * PATCH 753 - Enhanced with skeleton loaders and optimized images
 */

// Connection-aware components
export { ConnectionAwareLoader, NetworkQualityBadge } from './ConnectionAwareLoader';
export { ProgressiveContent, ProgressiveImage, ProgressiveList } from './ProgressiveContent';

// Offline support
export { OfflineSyncIndicator } from './OfflineSyncIndicator';

// Accessibility
export { AccessibleButton, SkipToContent, useFocusTrap, announceToScreenReader } from './AccessibleButton';

// Error handling
export { ErrorFallback, InlineError, EmptyState } from './ErrorFallback';

// Images
export { OptimizedImage } from './OptimizedImage';
export { OptimizedImagePro } from './OptimizedImagePro';

// Actions
export { ActionButton } from './ActionButton';

// Status
export { SystemStatusIndicator } from './SystemStatusIndicator';

// Micro-interactions
export { 
  SuccessAnimation, 
  Ripple, 
  PulseDot, 
  StatusIndicator, 
  NotificationBadge,
  LoadingDots,
  TypingIndicator,
  ProgressRing
} from './MicroInteractions';

// Feedback
export {
  InlineFeedback,
  SaveIndicator,
  CharacterCounter,
  FieldFeedback,
  ActionResult
} from './FeedbackComponents';

// Professional components
export {
  MetricCard,
  ProfessionalCard,
  StatusBadge,
  ModuleHeader,
  EmptyState as ProfessionalEmptyState,
  StatGrid,
  Divider,
  ChartContainer
} from './ProfessionalCard';

// Skeleton Loaders
export {
  SkeletonBase,
  SkeletonMetricCard,
  SkeletonTable,
  SkeletonChart,
  SkeletonList,
  SkeletonDashboard,
  SkeletonModule,
  SkeletonSidebar,
  SkeletonForm,
  ConnectionAwareLoader as SkeletonConnectionLoader
} from './SkeletonPro';
